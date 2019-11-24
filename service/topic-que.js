let Queue = require('better-queue');
let cache = require('memory-cache');
let shortid = require('shortid');

module.exports = class TopicQue {
    constructor(executionContext, cleanResultsAfter = 60000) {
        this._clearResultTimeout = cleanResultsAfter;
        this._topicQue = new Map();
        this._activeTasks = new cache.Cache();

        this.enque = this.enque.bind(this);
        this.status = this.status.bind(this);
        this._createQue = this._createQue.bind(this);
        this._processingCompleted = this._processingCompleted.bind(this);
        this._taskCompleted = this._taskCompleted.bind(this);
        this._taskFailed = this._taskFailed.bind(this);
        this._taskQued = this._taskQued.bind(this);
        this._taskStarted = this._taskStarted.bind(this);
        this._executionContext = executionContext;
    }

    enque(topicName, task, taskParams) {
        if (!this._topicQue.has(topicName)) {
            const q = this._createQue(topicName);
            this._topicQue.set(topicName, q);
        }

        const taskWrapper = { id: topicName + shortid.generate(), payload: task, params: taskParams };

        this._topicQue.get(topicName).push(taskWrapper);
        this._activeTasks.put(taskWrapper.id, { id: taskWrapper.id, status: "Posted" });
        return taskWrapper.id;
    }

    status(taskId) {
        return this._activeTasks.get(taskId);
    }

    _createQue(topicName) {
        var q = new Queue(async (input, cb) => {
            try {
                input.payload = input.payload.bind(this._executionContext);
                let result = await input.payload(...input.params);
                cb(null, result);
            }
            catch (err) {
                cb(err, null);
            }
        }, { afterProcessDelay: 1000 });

        q.on('drain', () => this._processingCompleted(topicName));
        q.on('task_finish', this._taskCompleted);
        q.on('task_failed', this._taskFailed);
        q.on('task_queued', this._taskQued);
        q.on('task_started', this._taskStarted);

        return q
    }

    _processingCompleted(topicName) {
        console.log("Clearing memory for:" + topicName);
        this._topicQue.delete(topicName);
    }

    _taskQued(taskId, X, Y) {
        this._activeTasks.put(taskId, { id: taskId, status: "Enqued" });
    }

    _taskStarted(taskId, X, Y) {
        //This seems to be timed event so it can occur even after taskcompleted event if the task is small enough.
        let task = this._activeTasks.get(taskId);
        if (task !== undefined && (task.status !== "Completed" && task.status !== "Error")) {
            this._activeTasks.put(taskId, { id: taskId, status: "Executing" });
        }
    }

    _taskCompleted(taskId, result, stats) {
        this._activeTasks.put(taskId, { id: taskId, status: "Completed", result: result, stats: stats }, this._clearResultTimeout);
    }

    _taskFailed(taskId, err, stats) {
        this._activeTasks.put(taskId, { id: taskId, status: "Error", error: err.toString(), stats: stats }, this._clearResultTimeout);
    }
}