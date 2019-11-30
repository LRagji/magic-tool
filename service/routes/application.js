const express = require('express');
const path = require('path');
const serviceNames = require('../service-names');

//TODO Add validation for each input field only alphanumeric
//TODO Splitup the code in backend for page and module differently
//IDEA Make a progress component for tasks executingon the page.

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
        this._validateJson = this._validateJson.bind(this);
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
        let validationResult = this._validateJson(req.body);
        if (validationResult !== undefined) {
            let validationError = new Error(validationResult);
            validationError.errorCode = 400;
            throw validationError;
        }
        const applicationName = req.body.name.toLowerCase();
        const npmCache = req.body.NPMCache === false ? undefined : this._npmCache;
        const enableDocker = !(req.body.enableDocker === false);

        return this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, npmCacheDir, schematicPath, enableDocker) {
            await this.createApplication(applicationName, workspaceDirectory, npmCacheDir, schematicPath, enableDocker);
        }, [applicationName, this._workspaceDirectory, npmCache, this._schematicPackagePath, enableDocker]);
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
            const installedElementsPath = path.join(parameter.applicationDir, '.installedElements.json');
            const fileContent = await this._fileRead(installedElementsPath);
            const installedElements = fileContent == undefined ? [] : JSON.parse(fileContent);
            let content = await this.layoutParse(parameter.template.main, installedElements, parameter.modulePath, parameter.applicationName, parameter.applicationDir, (name) => {
                const layout = parameter.template[name];
                if (layout == undefined) {
                    return [];
                }
                else {
                    return layout;
                }
            });
            await this._fileWrite(parameter.html, content.html);
            await this._fileWrite(parameter.css, content.style);
            await this._fileWrite(installedElementsPath, JSON.stringify(installedElements));

        }, [parameter]);
    }

    _safeTasker(req, res, handler) {
        try {
            const taskId = handler(req);
            res.redirect("/v1/tasks/" + taskId);
        }
        catch (err) {
            err.errorCode = err.errorCode == undefined ? -1 : err.errorCode;
            const possibleErrors = new Map();
            possibleErrors.set(400, { tittle: "Validation failed", HttpStatusCode: 400 });
            possibleErrors.set(-1, { tittle: "Unknown Error", HttpStatusCode: 500 });
            res.status(possibleErrors.get(err.errorCode).HttpStatusCode).send({ "message": possibleErrors.get(err.errorCode).tittle + ":" + err.message });
        }
    }

    _validateJson(json, path = "") {
        const onlyAlphaNumericORBlank = new RegExp('^[a-z0-9_]*$', 'i');
        return Object.keys(json).reduce((acc, key) => {
            if (acc !== undefined) return acc;
            let fullpath = path + "." + key;
            if (onlyAlphaNumericORBlank.test(key)) {
                let value = json[key];
                let valueType = typeof value;
                switch (valueType) {
                    case "string":
                    case "number":
                        if (!onlyAlphaNumericORBlank.test(value)) {
                            return "Only Alphanumeric & [_] characters allowed, [" + fullpath + "] voilates the same. ";
                        }
                        break;
                    case "undefined":
                    case "boolean":
                        // Dont do anything
                        break;
                    case "object":
                        return this._validateJson(value, fullpath);
                        break;
                }
            }
            else {
                return "Only Alphanumeric & [_] characters allowed, [" + fullpath + "] voilates the same. ";
            }
        }, undefined);
    }


}