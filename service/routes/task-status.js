const express = require('express');
const serviceNames = require('../service-names');

module.exports = class TaskStatus {
    constructor(dependencyContainer) {
        this._projectQue = dependencyContainer.get(serviceNames.Que);
        this.host = this.host.bind(this);
        this._taskStatus = this._taskStatus.bind(this);
    }

    host() {
        const router = express.Router();
        router.get('/tasks/:taskid', this._taskStatus);
        return router;
    }

    _taskStatus(req, res) {
        try {
            const taskId = req.params.taskid;
            const status = this._projectQue.status(taskId);
            if (status == undefined) {
                res.status(404).send({ "message": "Taskid:" + taskId + " not found." });
            }
            else {
                res.status(200).send(status);
            }
        }
        catch (ex) {
            res.status(500).send({ "message": "Unknown Error:" + ex.message });
        }
    }
}