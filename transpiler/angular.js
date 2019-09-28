// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
const npxCommand = 'npx';
const npmCommand = 'npm';
const bootstrapDesignSystem = "bootstrap";

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
        this._shellExecutor = this._locatorService.get(serviceNames.executorService);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._logger = this._locatorService.get(serviceNames.loggerService);

        this.createProject = this.createProject.bind(this);

        this._insertAt = this._insertAt.bind(this);
        this._clearWorkspaceFolder = this._clearWorkspaceFolder.bind(this);
        this._createAngularProject = this._createAngularProject.bind(this);
        this._installDependencies = this._installDependencies.bind(this);
        this._installBootstapDesignSystem = this._installBootstapDesignSystem.bind(this);
        this._createComponentsForModule = this._createComponentsForModule.bind(this);
        this._createModule = this._createModule.bind(this);
        this._fetchUniqueElementsFor = this._fetchUniqueElementsFor.bind(this);
        this._installElements = this._installElements.bind(this);

    }

    async createProject(config) {
        const fullWorkspace = config.workspace;
        const designSystem = config.designSystem;
        const projectName = config.name;
        const modules = config.modules;
        const logger = this._locatorService.get(serviceNames.loggerService);

        // // Clean up project space
        // logger.log(`Deleting existing project ${projectName}`);
        // await this._clearWorkspaceFolder(fullWorkspace, projectName);


        // // Create a new Project
        // logger.log(`Creating new project ${projectName}`);
        // await this._createAngularProject(fullWorkspace, projectName);

        // // Run NPM Install
        // logger.log(`Installing Dependencies`);
        // await this._installDependencies(fullWorkspace, projectName);

        // // Install Design System
        // if (designSystem === bootstrapDesignSystem) {
        //     logger.log(`Installing ${designSystem}`);
        //     await this._installBootstapDesignSystem(fullWorkspace, projectName);
        // }
        // else {
        //     logger.log(`Design System: ${designSystem} not found`);
        //     return;
        // }

        // // Inject Code for Schematics
        // const magicCodeInsert = 61;
        // const templates = this._locatorService.get(serviceNames.templateService);
        // await this._insertAt(this._path.join(fullWorkspace, projectName, 'node_modules/@schematics/angular/component/index.js'), magicCodeInsert, templates.routeUpdaterSchematic);

        // Create Modules
        for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
            const currentModule = modules[moduleCtr];
            await this._createModule(currentModule, fullWorkspace, projectName);
            await this._createComponentsForModule(currentModule, fullWorkspace, projectName);
            await this._installElements(currentModule, fullWorkspace, projectName);
        }
    }

    async _installElements(currentModule, fullWorkspace, projectName) {
        const moduleElements = this._fetchUniqueElementsFor(currentModule);
        for (let compCounter = 0; compCounter < moduleElements.length; compCounter++) {
            const element = moduleElements[compCounter];
            this._logger.log(`Installing ${element} for ${currentModule.name}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'add',
                "ngx-bootstrap",
                "--component",
                element
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    _fetchUniqueElementsFor(currentModule) {
        const moduleElements = new Set();
        const allowedElements = new Map();
        allowedElements.set('button', 'buttons');
        allowedElements.set('accordion', 'accordion');
        allowedElements.set('alert', 'alerts');
        allowedElements.set('carousel', 'carousel');
        allowedElements.set('collapse', 'collapse');
        allowedElements.set('datepicker', 'datepicker');
        allowedElements.set('dropdowns', 'dropdowns');
        allowedElements.set('modal', 'modals');
        allowedElements.set('pagination', 'pagination');
        allowedElements.set('popover', 'popover');
        allowedElements.set('progressbar', 'progressbar');
        allowedElements.set('rating', 'rating');
        allowedElements.set('sortable', 'sortable');
        allowedElements.set('tab', 'tabs');
        allowedElements.set('timepicker', 'timepicker');
        allowedElements.set('tooltip', 'tooltip');
        allowedElements.set('typeahead', 'typeahead');
        currentModule.components.forEach(component => {
            component.layouts.forEach((layout) => {
                layout.elements.forEach((element) => {
                    const elementName = allowedElements.get(element.name.toLowerCase());
                    if (elementName === undefined) {
                        this._logger.log("Cannot find component:" + element.name.toLowerCase());
                    }
                    else {
                        moduleElements.add(elementName);
                    }
                })
            })
        });

        return Array.from(moduleElements);
    }

    async _createModule(currentModule, fullWorkspace, projectName) {
        this._logger.log(`Creating module ${currentModule.name}`);
        return this._shellExecutor(npxCommand, [
            'ng',
            'generate',
            'module',
            currentModule.name,
            '--project=' + projectName,
            '--routing=true',
            '--route=' + currentModule.route,
            '--module=app'
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });

    }

    async _createComponentsForModule(currentModule, fullWorkspace, projectName) {

        for (let componentCtr = 0; componentCtr < currentModule.components.length; componentCtr++) {
            const currentComponent = currentModule.components[componentCtr];
            this._logger.log(`Creating component ${currentComponent.name} under ${currentModule.name}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'generate',
                'component',
                this._path.join(currentModule.name, currentComponent.name),
                '--entryComponent=' + (currentModule.route === currentComponent.route),
                '--project=' + projectName,
                '--module=' + currentModule.name,
                '--style=css',
                '--prefix=' + currentModule.name
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    async _clearWorkspaceFolder(fullWorkspace, projectName) {
        return this._shellExecutor('rm', [
            '-r',
            this._path.join(fullWorkspace, projectName),
        ], { 'cwd': fullWorkspace });
    }

    async _createAngularProject(fullWorkspace, projectName) {
        return this._shellExecutor(npxCommand, [
            'ng',
            'new',
            projectName,
            '--commit=false',
            '--interactive=false',
            '--skipInstall=true',
            '--skipGit=true',
            '--routing=true',
            '--style=css',
            '--verbose=true'
        ], { 'cwd': fullWorkspace });
    }

    async _installDependencies(fullWorkspace, projectName) {
        return this._shellExecutor(npmCommand, [
            'install',
            //'--verbose'
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });
    }

    async _installBootstapDesignSystem(fullWorkspace, projectName) {
        return this._shellExecutor(npxCommand, [
            'ng',
            'add',
            "ngx-bootstrap"
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });
    }

    async _insertAt(filePath, lineNumber, content) {
        const fs = this._locatorService.get(serviceNames.fileSystemService);
        let fileContentArray = fs.readFileSync(filePath).toString().split("\n");
        fileContentArray.splice(lineNumber, 0, content);
        return new Promise((acc, rej) => {
            fs.writeFile(filePath, fileContentArray.join("\n"), function (err) {
                if (err)
                    rej(err)
                else
                    acc();
            });
        });
    }

};
