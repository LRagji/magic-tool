// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
const windowsPlatform = 'win32';
const npxCommand = process.platform === windowsPlatform ? 'npx.cmd' : 'npx';
const npmCommand = process.platform === windowsPlatform ? 'npm.cmd' : 'npm';
const copyCommand = 'cp';

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
        this._shellExecutor = this._locatorService.get(serviceNames.executorService);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._logger = this._locatorService.get(serviceNames.loggerService);
        this._fs = this._locatorService.get(serviceNames.fileSystemService);
        this._elementsRepo = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);

        this.createProject = this.createProject.bind(this);

        this._insertAt = this._insertAt.bind(this);
        this._clearWorkspaceFolder = this._clearWorkspaceFolder.bind(this);
        this._createAngularProject = this._createAngularProject.bind(this);
        this._installDependencies = this._installDependencies.bind(this);
        this._createComponentsForModule = this._createComponentsForModule.bind(this);
        this._createModule = this._createModule.bind(this);
        this._fetchUniqueElementsFor = this._fetchUniqueElementsFor.bind(this);
        this._installElements = this._installElements.bind(this);
        this._createLayouts = this._createLayouts.bind(this);
    }

    async createProject(config) {
        const fullWorkspace = this._path.join(process.cwd(), config.workspace);
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

        //Copy utils node modules
        this._logger.log("Building schematics");
        await this._shellExecutor(npmCommand, [
            'run',
            'build'
        ], { 'cwd': this._path.join(fullWorkspace, '../transpiler/schematics/ng-utils') });

        this._logger.log("Copying schematics");
        await this._fs.copy(this._path.join(fullWorkspace, '../transpiler/schematics/ng-utils'), this._path.join(fullWorkspace, projectName, 'node_modules/ng-utils'));

        try {
            // Create Modules
            for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
                const currentModule = modules[moduleCtr];
                await this._createModule(currentModule, fullWorkspace, projectName);
                await this._installElements(currentModule, fullWorkspace, projectName);
                await this._createComponentsForModule(currentModule, fullWorkspace, projectName);
                await this._createLayouts(currentModule, fullWorkspace, projectName)
            }

            this._logger.log("Awesome!!");
        }
        finally {
            this._logger.log("Cleaning up schematics");
            await this._fs.remove(this._path.join(fullWorkspace, projectName, 'node_modules/ng-utils'));
        }
    }

    async _installElements(currentModule, fullWorkspace, projectName) {
        let installedElements = [];
        const moduleElementsSet = new Set();
        for (let componentCounter = 0; componentCounter < currentModule.components.length; componentCounter++) {
            const component = currentModule.components[componentCounter];
            await this._fetchUniqueElementsFor(component.layouts, moduleElementsSet);
        };

        const moduleElements = Array.from(moduleElementsSet);;
        for (let compCounter = 0; compCounter < moduleElements.length; compCounter++) {
            const element = moduleElements[compCounter];
            const elementShell = element.package.execute;
            if (installedElements.indexOf(elementShell) === -1 && elementShell !== "" && elementShell !== undefined) {

                this._logger.log(`Executing ${elementShell} for ${currentModule.name}`);
                await this._shellExecutor(npxCommand, element.package.execute.split(' '), { 'cwd': this._path.join(fullWorkspace, projectName) });

                const moduleDependencies = element.package.moduleImports;
                for (let dependencyCtr = 0; dependencyCtr < moduleDependencies.length; dependencyCtr++) {
                    const dependency = moduleDependencies[dependencyCtr];
                    this._logger.log(`Installing dependency: ${dependency.moduleName} for module: ${currentModule.name}`);
                    await this._shellExecutor(npxCommand, [
                        'ng',
                        'g',
                        "ng-utils:add-imports",
                        `--module-path=${currentModule.path}`,
                        `--component-name=${dependency.moduleName}`,
                        `--component-path=${dependency.link}`
                    ], { 'cwd': this._path.join(fullWorkspace, projectName) });
                }
                installedElements.push(elementShell);
            }
            else {
                if (elementShell === undefined || elementShell === "") {
                    this._logger.log(`Skipped installing inbuilt module for ${currentModule.name}.`);
                }
                else {
                    this._logger.log(`Skipped executing ${elementShell} for ${currentModule.name} as it is already installed.`);
                }
            }
        }
    }

    async _fetchUniqueElementsFor(layouts, uniqueElements) {
        for (let layoutCounter = 0; layoutCounter < layouts.length; layoutCounter++) {
            const layout = layouts[layoutCounter];
            for (let elementCounter = 0; elementCounter < layout.elements.length; elementCounter++) {
                const element = layout.elements[elementCounter];
                const repoElement = this._elementsRepo[element.name];
                if (repoElement === undefined) {
                    this._logger.log("Cannot find component:" + element.name);
                }
                else {
                    if (element.name === 'layout') {
                        try {
                            const nestedLayout = await this._jsonReader.readFile(element.properties.layout);
                            await this._fetchUniqueElementsFor(nestedLayout, uniqueElements);
                        }
                        catch (err) {
                            this._logger.log("Failed to fetch elements from  custom Layout:" + err.toString());
                        }
                    }
                    else {
                        uniqueElements.add(repoElement);
                    }
                }
            };
        };
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

            const routerModulePath = currentModule.path.replace('.module.ts', '-routing.module.ts');
            let componentName = currentComponent.name.toLowerCase();
            componentName = componentName.charAt(0).toUpperCase() + componentName.substring(1, componentName.length);
            componentName = componentName + "Component";
            this._logger.log(`Importing: ${componentName} in routing module: ${routerModulePath}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-declare-imports",
                `--module-path=${routerModulePath}`,
                `--component-name=${componentName}`,
                `--component-path=./${currentComponent.name}/${currentComponent.name}.component`
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });

            this._logger.log(`Adding route for: ${componentName}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-entry-routing-table",
                `--router-path=${routerModulePath}`,
                `--route=${(currentModule.route === currentComponent.route) ? currentComponent.name.toLowerCase() : currentComponent.route}`, //DEFECT :https://github.com/LRagji/magic-tool/issues/2
                `--component-name=${componentName}`
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    async _createLayouts(currentModule, fullWorkspace, projectName) {
        const layoutBuilder = this._locatorService.get(serviceNames.parser);
        for (let componentCtr = 0; componentCtr < currentModule.components.length; componentCtr++) {
            const currentComponent = currentModule.components[componentCtr];
            currentComponent.path = {
                "html": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.html`),
                "ts": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.ts`),
                "css": this._path.join('src/app/', currentModule.name, `${currentComponent.name}/${currentComponent.name}.component.css`)
            }
            this._logger.log(`Building layout for ${currentComponent.name} under ${currentModule.name}`);
            let htmlContent = await layoutBuilder.parse(currentComponent.layouts, currentComponent.container);
            await this._fs.writeFile(this._path.join(fullWorkspace, projectName, currentComponent.path.html), htmlContent);
        }
    }

    async _clearWorkspaceFolder(fullWorkspace, projectName) {
        const porjectPath = this._path.join(fullWorkspace, projectName);
        try {
            await this._fs.access(porjectPath);
        }
        catch (err) {
            await this._fs.mkdir(porjectPath, { recursive: true });
        }
        this._fs.remove(porjectPath);
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
        const htmlContent = `<router-outlet></router-outlet>`;
        await this._fs.writeFile(this._path.join(fullWorkspace, projectName, 'src/app/app.component.html'), htmlContent);
    }

    async _installDependencies(fullWorkspace, projectName) {
        return this._shellExecutor(npmCommand, [
            'install',
            '--verbose'
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });
    }

    async _insertAt(filePath, lineNumber, content) {
        let fileContent = await this._fs.readFile(filePath);
        let fileContentArray = fileContent.toString().split("\n");
        fileContentArray.splice(lineNumber, 0, content);
        await this._fs.writeFile(filePath, fileContentArray.join("\n"));
    }
};
