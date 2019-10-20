// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
const windowsPlatform = 'win32';
const npxCommand = 'npx';
const npmCommand = 'npm';

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
        this._shellExecutor = this._locatorService.get(serviceNames.executorService);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._logger = this._locatorService.get(serviceNames.loggerService);
        this._fs = this._locatorService.get(serviceNames.fileSystemService);
        this._elementsRepo = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);
        this._toolRootDirectory = this._locatorService.get(serviceNames.toolRootDirectory);

        this.createProject = this.createProject.bind(this);

        this._clearWorkspaceFolder = this._clearWorkspaceFolder.bind(this);
        this._createAngularProject = this._createAngularProject.bind(this);
        this._installDependencies = this._installDependencies.bind(this);
        this._createPagesForModule = this._createPagesForModule.bind(this);
        this._createModule = this._createModule.bind(this);
        this._fetchUniqueElementsFor = this._fetchUniqueElementsFor.bind(this);
        this._installElements = this._installElements.bind(this);
        this._createLayouts = this._createLayouts.bind(this);
        this._executeElementCommands = this._executeElementCommands.bind(this);
    }

    async createProject(config) {
        const fullWorkspace = this._path.join(process.cwd(), config.workspace);
        const projectName = config.name;
        const modules = config.modules;

        // // Clean up project space
        // this._logger.log(`Deleting existing project ${projectName}`);
        // await this._clearWorkspaceFolder(fullWorkspace, projectName);

        // // Create a new Project
        // this._logger.log(`Creating new project ${projectName}`);
        // await this._createAngularProject(fullWorkspace, projectName);

        // // Run NPM Install
        // this._logger.log(`Installing Dependencies`);
        // await this._installDependencies(fullWorkspace, projectName);

        //Copy utils node modules
        this._logger.log("Building schematics");
        await this._shellExecutor(npmCommand, [
            'run',
            'build'
        ], { 'cwd': this._path.join(this._toolRootDirectory, '/transpiler/schematics/ng-utils') });

        this._logger.log("Installing schematics");
        await this._shellExecutor(npmCommand, [
            'install',
            this._path.join(this._toolRootDirectory, '/transpiler/schematics/ng-utils')
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });

        try {
            // Create Modules
            for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
                const currentModule = modules[moduleCtr];
                await this._createModule(currentModule, fullWorkspace, projectName);
                await this._installElements(currentModule, fullWorkspace, projectName);
                await this._createPagesForModule(currentModule, fullWorkspace, projectName);
                await this._createLayouts(currentModule, fullWorkspace, projectName)
            }

            this._logger.bold("Awesome!!");
        }
        catch (err) {
            this._logger.exception(err);
        }
        finally {
            this._logger.log("Uninstalling schematics");
            await this._shellExecutor(npmCommand, [
                'uninstall',
                'ng-utils'
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    async _installElements(currentModule, fullWorkspace, projectName) {
        let installedElements = [];
        const moduleElementsSet = new Set();
        for (let pageCounter = 0; pageCounter < currentModule.pages.length; pageCounter++) {
            const page = currentModule.pages[pageCounter];
            await this._fetchUniqueElementsFor(page.elements, moduleElementsSet);
        };

        const moduleElements = Array.from(moduleElementsSet);;
        for (let compCounter = 0; compCounter < moduleElements.length; compCounter++) {
            const element = moduleElements[compCounter];
            const executeDirectory = this._path.join(fullWorkspace, projectName);
            await this._executeElementCommands(element, currentModule, installedElements, executeDirectory);
        }
    }

    async _executeElementCommands(element, currentModule, installedElements, executeDirectory) {
        for (let exeCounter = 0; exeCounter < element.package.execute.length; exeCounter++) {
            const elementShell = element.package.execute[exeCounter];
            if (installedElements.indexOf(elementShell) === -1 && elementShell !== "" && elementShell !== undefined) {

                this._logger.log(`Executing ${elementShell} for ${currentModule.name}`);
                let brokenCommand = elementShell.split(' ');
                brokenCommand = brokenCommand.reduce((acc, param, idx) => {
                    let cmd = param.trim();
                    if (cmd !== "") {
                        acc.push(cmd);
                    }
                    return acc;
                }, []);
                const command = brokenCommand[0];
                brokenCommand.splice(0, 1)
                await this._shellExecutor(command, brokenCommand, { 'cwd': executeDirectory });

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
                    ], { 'cwd': executeDirectory });
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

    async _fetchUniqueElementsFor(elements, uniqueElements) {
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            const repoElement = this._elementsRepo[element.type];
            if (repoElement === undefined) {
                this._logger.log("Cannot find component of type:" + element.type);
            }
            else {
                uniqueElements.add(repoElement);
            }
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

    async _createPagesForModule(currentModule, fullWorkspace, projectName) {

        for (let pageCtr = 0; pageCtr < currentModule.pages.length; pageCtr++) {
            const page = currentModule.pages[pageCtr];
            this._logger.log(`Creating component ${page.name} under ${currentModule.name}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'generate',
                'component',
                this._path.join(currentModule.name, page.name),
                '--entryComponent=' + (currentModule.route === page.route),
                '--project=' + projectName,
                '--module=' + currentModule.name,
                '--style=css',
                '--prefix=' + currentModule.name
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });

            const routerModulePath = currentModule.path.replace('.module.ts', '-routing.module.ts');
            let pageName = page.name.toLowerCase();
            pageName = pageName.charAt(0).toUpperCase() + pageName.substring(1, pageName.length);
            pageName = pageName + "Component";
            this._logger.log(`Importing: ${pageName} in routing module: ${routerModulePath}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-declare-imports",
                `--module-path=${routerModulePath}`,
                `--component-name=${pageName}`,
                `--component-path=./${page.name}/${page.name}.component`
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });

            this._logger.log(`Adding route for: ${pageName}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-entry-routing-table",
                `--router-path=${routerModulePath}`,
                `--route=${(currentModule.route === page.route) ? page.name.toLowerCase() : page.route}`, //DEFECT :https://github.com/LRagji/magic-tool/issues/2
                `--component-name=${pageName}`
            ], { 'cwd': this._path.join(fullWorkspace, projectName) });
        }
    }

    async _createLayouts(currentModule, fullWorkspace, projectName) {
        const layoutBuilder = this._locatorService.get(serviceNames.parser);
        for (let pageCtr = 0; pageCtr < currentModule.pages.length; pageCtr++) {
            const page = currentModule.pages[pageCtr];
            page.path = {
                "html": this._path.join('src/app/', currentModule.name, `${page.name}/${page.name}.component.html`),
                "ts": this._path.join('src/app/', currentModule.name, `${page.name}/${page.name}.component.ts`),
                "css": this._path.join('src/app/', currentModule.name, `${page.name}/${page.name}.component.css`)
            }
            this._logger.log(`Building layout for ${page.name} under ${currentModule.name}`);
            let htmlContent = await layoutBuilder.parse(page.elements);
            await this._fs.writeFile(this._path.join(fullWorkspace, projectName, page.path.html), htmlContent);
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
        await this._fs.remove(porjectPath);
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
};
