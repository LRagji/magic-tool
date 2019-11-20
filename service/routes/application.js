const express = require('express');
const fs = require('fs');
const path = require('path');
const serviceNames = require('../service-names');

module.exports = class Application {
    constructor(dependencyContainer) {
        this._workspaceDirectory = dependencyContainer.get(serviceNames.WorkSpaceDirectoryPath);
        this._npmCache = dependencyContainer.get(serviceNames.NPMCacheDirectory);
        this._projectQue = dependencyContainer.get(serviceNames.Que);
        this._schematicPackagePath = dependencyContainer.get(serviceNames.SchematicPath);
        this.host = this.host.bind(this);
        this._createApp = this._createApp.bind(this);
    }

    host() {
        const router = express.Router();
        router.post('/apps', this._createApp);
        return router;
    }

    _createApp(req, res) {
        try {
            const applicationName = req.body.name.toLowerCase();
            const npmCache = req.body.NPMCache === false ? undefined : this._npmCache;
            const applicationDir = path.join(this._workspaceDirectory, applicationName);
            if (fs.existsSync(applicationDir)) {
                res.status(409).send({ "message": "Application already exist:" + applicationDir });
            }
            else {
                const taskId = this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, npmCacheDir, schematicPath) {
                    await this._executeShell(this.npxCommand, [
                        '-p',
                        '@angular/cli',
                        'ng',
                        'new',
                        applicationName,
                        '--commit=false',
                        '--interactive=false',
                        '--skipInstall=true',
                        '--skipGit=true',
                        '--routing=true',
                        '--style=css',
                        '--verbose=true'
                    ], { 'cwd': workspaceDirectory });
                    await this._npmInstall(path.join(workspaceDirectory, applicationName), schematicPath, npmCacheDir);
                }, [applicationName, this._workspaceDirectory, npmCache, this._schematicPackagePath]);

                res.status(202).send({
                    message: "Check status of task " + taskId + " for completion."
                });
            }
        }
        catch (ex) {
            res.status(500).send({ "message": "Unknown Error:" + ex.message });
        }
    }

}