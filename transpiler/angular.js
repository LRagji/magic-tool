// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
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
        this._createLayouts = this._createLayouts.bind(this);
        this._updateIndexPage = this._updateIndexPage.bind(this);
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
            let indexPage = [];
            // Create Modules
            for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
                const currentModule = modules[moduleCtr];
                await this._createModule(currentModule, fullWorkspace, projectName);
                indexPage = indexPage.concat(await this._createPagesForModule(currentModule, fullWorkspace, projectName));
                await this._createLayouts(currentModule, fullWorkspace, projectName);
            }
            await this._updateIndexPage(fullWorkspace, projectName, indexPage);
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
        const indexPage = [];
        for (let pageCtr = 0; pageCtr < currentModule.pages.length; pageCtr++) {
            const page = currentModule.pages[pageCtr];
            this._logger.log(`Creating page ${page.name} under ${currentModule.name}`);
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

            indexPage.push(`<button routerLink="${currentModule.route + "/" + page.route}">${currentModule.name + " " + pageName}</button>`);
        }

        return indexPage;
    }

    async _updateIndexPage(fullWorkspace, projectName, indexPageContents) {
        const htmlContent = `<router-outlet></router-outlet>` + indexPageContents.join('');
        await this._fs.writeFile(this._path.join(fullWorkspace, projectName, 'src/app/app.component.html'), htmlContent);
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
            const executeDirectory = this._path.join(fullWorkspace, projectName)
            let htmlContent = await layoutBuilder.parse(page.elements, [], currentModule, projectName, executeDirectory);
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

    }

    async _installDependencies(fullWorkspace, projectName) {
        return this._shellExecutor(npmCommand, [
            'install',
            '--verbose'
        ], { 'cwd': this._path.join(fullWorkspace, projectName) });
    }
};
