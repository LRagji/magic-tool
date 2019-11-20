const express = require('express')
const application = require('./routes/application');
const taskStatus = require('./routes/task-status');
const dependencyInjector = require('../transpiler/dependency-injector');
const serviceNames = require('./service-names');
const logger = require('./service-logger');
const app = express();
const bodyParser = require('body-parser');
const topicQ = require('./topic-que');
const utils = require('./exec-utilities');

const defaultPort = 3000;
const defaultPath = "C:/Users/Lauki/Documents/Git/magic-tool/service/workspace";

class MagicService {
    constructor() {
        this.entryPoint = this.entryPoint.bind(this);
        this._dependencyContainer = new dependencyInjector();
        this._dependencyContainer.register(serviceNames.loggerService, logger);
        const projectBasedExecutionQue = new topicQ(new utils(this._dependencyContainer));
        this._dependencyContainer.register(serviceNames.Que, projectBasedExecutionQue);
    }

    entryPoint(args) {
        this.workspace = args[2] || process.env.WORKSPACEPATH || defaultPath;
        this._dependencyContainer.register(serviceNames.WorkSpaceDirectoryPath, this.workspace);
        this.port = args[3] || process.env.SERVICEPORT || defaultPort;
        const applicationRouter = new application(this._dependencyContainer).host();
        const statusRouter = new taskStatus(this._dependencyContainer).host();

        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use('/v1', applicationRouter);
        app.use('/v1', statusRouter);
        app.listen(this.port, () => console.log(`Magic Service active on ${this.port}!`))
    }

}

const mainProgram = new MagicService();
mainProgram.entryPoint(process.argv);

// let LId = projectBasedExecutionQue.enque("Laukik", () => console.log("Work for laukik"));
// console.log(LId + projectBasedExecutionQue.status(LId));