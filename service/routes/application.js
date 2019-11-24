const express = require('express');
const path = require('path');
const serviceNames = require('../service-names');
//TODO Add validation for each input field only alphanumeric
//TODO Move the code backend class in context for each api controller
//TODO Splitup the code in backend for page and module differently

module.exports = class Application {
    constructor(dependencyContainer) {
        this._workspaceDirectory = dependencyContainer.get(serviceNames.WorkSpaceDirectoryPath);
        this._npmCache = dependencyContainer.get(serviceNames.NPMCacheDirectory);
        this._projectQue = dependencyContainer.get(serviceNames.Que);
        this._schematicPackagePath = dependencyContainer.get(serviceNames.SchematicPath);
        this.host = this.host.bind(this);
        this._createApp = this._createApp.bind(this);
        this._createModule = this._createModule.bind(this);
        this._createLayouts = this._createLayouts.bind(this);
        this._safeTasker = this._safeTasker.bind(this);
        this._createPage = this._createPage.bind(this);
    }

    host() {
        const router = express.Router();
        router.post('/apps', (req, res) => this._safeTasker(req, res, this._createApp));
        router.post('/apps/:app/modules', (req, res) => this._safeTasker(req, res, this._createModule));
        router.post('/apps/:app/modules/:module/pages', (req, res) => this._safeTasker(req, res, this._createPage));
        router.post('/apps/:app/modules/:module/pages/:page/layout', (req, res) => this._safeTasker(req, res, this._createLayouts));
        return router;
    }

    _createApp(req) {
        const applicationName = req.body.name.toLowerCase();
        const npmCache = req.body.NPMCache === false ? undefined : this._npmCache;

        return this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, npmCacheDir, schematicPath) {
            await this.createApplication(applicationName, workspaceDirectory, npmCacheDir, schematicPath);
        }, [applicationName, this._workspaceDirectory, npmCache, this._schematicPackagePath]);
    }

    _createModule(req) {
        const applicationName = req.params.app.toLowerCase();

        return this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, moduleDefination) {
            await this.createModule(applicationName, workspaceDirectory, moduleDefination);
        }, [applicationName, this._workspaceDirectory, req.body]);

    }

    _createPage(req) {

    }

    _createLayouts(req) {
        const applicationName = req.params.app.toLowerCase();
        const moduleName = req.params.module.toLowerCase();
        const pageName = req.params.page.toLowerCase();
        const parameter = {
            "applicationName": applicationName,
            "modulePath": path.join("/src/app/", `${moduleName}/${moduleName}.module.ts`),
            "applicationDir": path.join(this._workspaceDirectory, applicationName),
            "html": path.join(this._workspaceDirectory, applicationName, 'src/app/', moduleName, `${pageName}/${pageName}.component.html`),
            "ts": path.join(this._workspaceDirectory, applicationName, 'src/app/', moduleName, `${pageName}/${pageName}.component.ts`),
            "css": path.join(this._workspaceDirectory, applicationName, 'src/app/', moduleName, `${pageName}/${pageName}.component.css`),
            "template": req.body
        }
        return this._projectQue.enque(applicationName, async function (parameter) {
            let htmlContent = await this.layoutParse(parameter.template.main, [], parameter.modulePath, parameter.applicationName, parameter.applicationDir, (name) => {
                const layout = parameter.template[name];
                if (layout == undefined) {
                    return [];
                }
                else {
                    return layout;
                }
            });
            await this._fileWrite(parameter.html, htmlContent);

        }, [parameter]);
    }

    _safeTasker(req, res, handler) {
        try {
            const taskId = handler(req);
            res.redirect("/v1/tasks/" + taskId);
        }
        catch (err) {
            res.status(500).send({ "message": "Unknown Error:" + err.message });
        }
    }

}