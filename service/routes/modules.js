const express = require('express');
const fs = require('fs');
const path = require('path');
const serviceNames = require('../service-names');

module.exports = class Modules {
    constructor(dependencyContainer) {
        this._workspaceDirectory = dependencyContainer.get(serviceNames.WorkSpaceDirectoryPath);
        this._projectQue = dependencyContainer.get(serviceNames.Que);
        this.host = this.host.bind(this);
        this._createModule = this._createModule.bind(this);
    }

    host() {
        const router = express.Router();
        router.post('/:app/modules', this._createModule);
        return router;
    }

    _createModule(req, res) {
        try {
            const applicationName = req.params.app.toLowerCase();
            const moduleName = req.body.name.toLowerCase();
            const moduleRoute = req.body.route.toLowerCase();

            const taskId = this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, moduleName, moduleRoute) {
                const applicationDir = path.join(workspaceDirectory, applicationName);
                if (this._fileExists(applicationDir)) {
                    this._executeShell(this.npxCommand, [
                        'ng',
                        'generate',
                        'module',
                        moduleName,
                        '--project=' + applicationName,
                        '--routing=true',
                        '--route=' + moduleRoute,
                        '--module=app'
                    ], { 'cwd': applicationDir });
                }
                else {
                    throw new Error("Application" + applicationDir + " is not created.");
                }
            }, [applicationName, this._workspaceDirectory, moduleName, moduleRoute]);

            res.status(202).send({
                message: "Check status of task " + taskId + " for completion."
            });
        }
        catch (ex) {
            res.status(500).send({ "message": "Unknown Error:" + ex.message });
        }
    }

}