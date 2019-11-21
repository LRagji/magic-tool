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

            const taskId = this._projectQue.enque(applicationName, async function (applicationName, workspaceDirectory, currentModule) {
                const applicationDir = path.join(workspaceDirectory, applicationName);
                if (!this._fileExists(applicationDir)) {
                    throw new Error("Application" + applicationDir + " is not created.");
                }
                //Module Create
               await this._executeShell(this.npxCommand, [
                    'ng',
                    'generate',
                    'module',
                    currentModule.name,
                    '--project=' + applicationName,
                    '--routing=true',
                    '--route=' + currentModule.route,
                    '--module=app'
                ], { 'cwd': applicationDir });
                currentModule.path = path.join("/src/app/", `${currentModule.name}/${currentModule.name}.module.ts`);
                //Pages Create
                const indexPage = [];
                for (let pageCtr = 0; pageCtr < currentModule.pages.length; pageCtr++) {
                    const page = currentModule.pages[pageCtr];
                    this._logger.log(`Creating page ${page.name} under ${currentModule.name}`);
                    await this._executeShell(this.npxCommand, [
                        'ng',
                        'generate',
                        'component',
                        path.join(currentModule.name, page.name),
                        '--entryComponent=' + (currentModule.route === page.route),
                        '--project=' + applicationName,
                        '--module=' + currentModule.name,
                        '--style=css',
                        '--prefix=' + currentModule.name
                    ], { 'cwd': applicationDir });

                    const routerModulePath = currentModule.path.replace('.module.ts', '-routing.module.ts');
                    let pageName = page.name.toLowerCase();
                    pageName = pageName.charAt(0).toUpperCase() + pageName.substring(1, pageName.length);
                    pageName = pageName + "Component";
                    this._logger.log(`Importing: ${pageName} in routing module: ${routerModulePath}`);
                    await this._executeShell(this.npxCommand, [
                        'ng',
                        'g',
                        "ng-utils:add-declare-imports",
                        `--module-path=${routerModulePath}`,
                        `--component-name=${pageName}`,
                        `--component-path=./${page.name}/${page.name}.component`
                    ], { 'cwd': applicationDir });

                    this._logger.log(`Adding route for: ${pageName}`);
                    await this._executeShell(this.npxCommand, [
                        'ng',
                        'g',
                        "ng-utils:add-entry-routing-table",
                        `--router-path=${routerModulePath}`,
                        `--route=${(currentModule.route === page.route) ? page.name.toLowerCase() : page.route}`, //DEFECT :https://github.com/LRagji/magic-tool/issues/2
                        `--component-name=${pageName}`
                    ], { 'cwd': applicationDir });

                    indexPage.push(`<li><a href="${currentModule.route + "/" + page.route}">${pageName}</a></li>`);
                }

                //Update Index Page
                const htmlContent = `<h4>${currentModule.name}</h4><ul>${indexPage.join(' ')}</ul>`
                this._fileAppend(path.join(applicationDir, 'src/app/app.component.html'), htmlContent);

            }, [applicationName, this._workspaceDirectory, req.body]);

            res.redirect("/v1/tasks/" + taskId);
        }
        catch (ex) {
            res.status(500).send({ "message": "Unknown Error:" + ex.message });
        }
    }
}