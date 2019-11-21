const express = require('express');
const path = require('path');
const serviceNames = require('../service-names');
const Modules = require('./modules');

module.exports = class Application {
    constructor(dependencyContainer) {
        this._workspaceDirectory = dependencyContainer.get(serviceNames.WorkSpaceDirectoryPath);
        this._npmCache = dependencyContainer.get(serviceNames.NPMCacheDirectory);
        this._projectQue = dependencyContainer.get(serviceNames.Que);
        this._schematicPackagePath = dependencyContainer.get(serviceNames.SchematicPath);
        this.host = this.host.bind(this);
        this._createApp = this._createApp.bind(this);
        this._modules = new Modules(dependencyContainer);
    }

    host() {
        const router = express.Router();
        router.post('/apps', this._createApp);
        router.use('/apps', this._modules.host());
        return router;
    }

    _createApp(req, res) {
        try {
            const applicationName = req.body.name.toLowerCase();
            const npmCache = req.body.NPMCache === false ? undefined : this._npmCache;

            const taskId = this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, npmCacheDir, schematicPath) {
                const applicationDir = path.join(workspaceDirectory, applicationName);
                if (this._fileExists(applicationDir)) {
                    throw new Error("Application" + applicationDir + " already exists.");
                }
                //Angular CLI
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
                //NPM Install
                await this._npmInstall(applicationDir, schematicPath, npmCacheDir);
                //Clear Index Page
               this._fileWrite(path.join(applicationDir,'src/app/app.component.html'), `<router-outlet></router-outlet>`);

            }, [applicationName, this._workspaceDirectory, npmCache, this._schematicPackagePath]);

            res.redirect("/v1/tasks/"+taskId);
        }
        catch (ex) {
            res.status(500).send({ "message": "Unknown Error:" + ex.message });
        }
    }

}