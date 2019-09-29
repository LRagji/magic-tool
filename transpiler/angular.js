// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
const npxCommand = 'npx';
const npmCommand = 'npm';
const copyCommand = 'cp';
const deleteCommand = 'rm';
const bootstrapDesignSystem = "bootstrap";

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
        this._shellExecutor = this._locatorService.get(serviceNames.executorService);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._logger = this._locatorService.get(serviceNames.loggerService);
        this._fs = this._locatorService.get(serviceNames.fileSystemService);
        this._elementsRepo = this._locatorService.get(serviceNames.elementsRepo);

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

        // Clean up project space
        logger.log(`Deleting existing project ${projectName}`);
        await this._clearWorkspaceFolder(fullWorkspace, projectName);


        // Create a new Project
        logger.log(`Creating new project ${projectName}`);
        await this._createAngularProject(fullWorkspace, projectName);

        // Run NPM Install
        logger.log(`Installing Dependencies`);
        await this._installDependencies(fullWorkspace, projectName);

        // Install Design System
        if (designSystem === bootstrapDesignSystem) {
            logger.log(`Installing ${designSystem}`);
            await this._installBootstapDesignSystem(fullWorkspace, projectName);
        }
        else {
            logger.log(`Design System: ${designSystem} not found`);
            return;
        }

        //Inject Code for Schematics
        const magicCodeInsert = 61;
        const templates = this._locatorService.get(serviceNames.templateService);
        await this._insertAt(this._path.join(fullWorkspace, projectName, 'node_modules/@schematics/angular/component/index.js'), magicCodeInsert, templates.routeUpdaterSchematic);

        //Copy utils node modules
        this._logger.log("Building schematics");
        await this._shellExecutor(npmCommand, [
            'run',
            'build'
        ], { 'cwd': this._path.join(fullWorkspace, '../transpiler/schematics/ng-utils') });

        this._logger.log("Copying schematics");
        await this._shellExecutor(copyCommand, [
            '-r',
            this._path.join(fullWorkspace, '../transpiler/schematics/ng-utils'),
            'node_modules'
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });

        try {
            // Create Modules
            for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
                const currentModule = modules[moduleCtr];
                await this._createModule(currentModule, fullWorkspace, projectName);
                await this._installElements(currentModule, fullWorkspace, projectName);
                await this._createComponentsForModule(currentModule, fullWorkspace, projectName);

            }
        }
        finally {
            this._logger.log("Cleaning up schematics");
            await this._shellExecutor(deleteCommand, [
                '-r',
                'node_modules/ng-utils',
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    async _installElements(currentModule, fullWorkspace, projectName) {
        let installedElements = [];
        const moduleElements = this._fetchUniqueElementsFor(currentModule);
        for (let compCounter = 0; compCounter < moduleElements.length; compCounter++) {
            const element = moduleElements[compCounter];
            if (installedElements.indexOf(element.installName) == -1) {
                this._logger.log(`Installing ${element.installName} for ${currentModule.name}`);
                await this._shellExecutor(npxCommand, [
                    'ng',
                    'add',
                    "ngx-bootstrap",
                    "--component",
                    element.installName
                ], { 'cwd': this._path.join(fullWorkspace, projectName) });

                const moduleDependencies = element.dependencies;
                for (let dependencyCtr = 0; dependencyCtr < moduleDependencies.length; dependencyCtr++) {
                    const dependency = moduleDependencies[dependencyCtr];
                    this._logger.log(`Installing dependency: ${dependency.moduleName} for element: ${element} within module: ${currentModule.name}`);
                    await this._shellExecutor(npxCommand, [
                        'ng',
                        'g',
                        "ng-utils:add-imports",
                        `--module-path=${currentModule.path}`,
                        `--component-name=${dependency.moduleName}`,
                        `--component-path=${dependency.link}`
                    ], { 'cwd': this._path.join(fullWorkspace, projectName) });
                }
                installedElements.push(element.installName);
            }
            else {
                this._logger.log(`Skipped Installing ${element.installName} for ${currentModule.name} as it is already installed.`);
            }
        }
    }

    _fetchUniqueElementsFor(currentModule) {
        const moduleElements = new Set();
        currentModule.components.forEach(component => {
            component.layouts.forEach((layout) => {
                layout.elements.forEach((element) => {
                    const repoElement = this._elementsRepo[element.name];
                    if (repoElement === undefined) {
                        this._logger.log("Cannot find component:" + element.name);
                    }
                    else {
                        moduleElements.add(repoElement);
                    }
                })
            })
        });

        return Array.from(moduleElements);
    }

    async _createModule(currentModule, fullWorkspace, projectName) {
        this._logger.log(`Creating module ${currentModule.name}`);
        currentModule.path = this._path.join("/src/app/", `${currentModule.name}/${currentModule.name}.module.ts`);
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
        const layoutBuilder = this._locatorService.get(serviceNames.parser);
        for (let componentCtr = 0; componentCtr < currentModule.components.length; componentCtr++) {
            const currentComponent = currentModule.components[componentCtr];
            currentComponent.path = {
                "html": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.html`),
                "ts": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.ts`),
                "css": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.css`)
            }
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

            this._logger.log(`Building layout for ${currentComponent.name} under ${currentModule.name}`);
            let htmlContent = layoutBuilder.parse(currentComponent.layouts);
            await this._fs.writeFile(this._path.join(fullWorkspace, projectName, currentComponent.path.html), htmlContent);
        }
    }

    async _clearWorkspaceFolder(fullWorkspace, projectName) {
        return this._shellExecutor('rm', [
            '-r',
            this._path.join(fullWorkspace, projectName),
        ], { 'cwd': fullWorkspace });
    }

    async _createAngularProject(fullWorkspace, projectName) {
        await this._shellExecutor(npxCommand, [
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
        const htmlContent=`<router-outlet></router-outlet>`;
        await this._fs.writeFile(this._path.join(fullWorkspace, projectName, 'src/app/app.component.html'), htmlContent);
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
        let fileContent = await this._fs.readFile(filePath);
        let fileContentArray = fileContent.toString().split("\n");
        fileContentArray.splice(lineNumber, 0, content);
        await this._fs.writeFile(filePath, fileContentArray.join("\n"));
    }

};
