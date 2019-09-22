// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const serviceNames = require('./service-names');
const npxCommand = 'npx';
const npmCommand = 'npm';

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
        this.createProject = this.createProject.bind(this);
        this.insertAt = this.insertAt.bind(this);
    }

    async createProject(config) {
        const shellExecutor = this._locatorService.get(serviceNames.executorService);
        const path = this._locatorService.get(serviceNames.pathService);
        const fullWorkspace = config.workspace;
        const projectName = config.name;
        const cmdOptions = { 'cwd': fullWorkspace };
        const modules = config.modules;
        const logger = this._locatorService.get(serviceNames.loggerService);

        // Clean up project space
        logger.log(`Deleting existing project ${projectName}`);
        await shellExecutor('rm', [
            '-r',
            path.join(fullWorkspace, projectName),
        ], cmdOptions);

        // Create a new Project
        logger.log(`Creating new project ${projectName}`);
        await shellExecutor(npxCommand, [
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
        ], cmdOptions);

        // Run NPM Install
        logger.log(`Running NPM Install`);
        await shellExecutor(npmCommand, [
            'install',
            '--verbose'
        ], { 'cwd': path.join(fullWorkspace, projectName) });

        // Inject Code for Schematics
        const magicCodeInsert = 61;
        const templates = this._locatorService.get(serviceNames.templateService);
        await this.insertAt(path.join(fullWorkspace, projectName, 'node_modules/@schematics/angular/component/index.js'), magicCodeInsert, templates.routeUpdaterSchematic);

        // Create Modules
        for (let moduleCtr = 0; moduleCtr < modules.length; moduleCtr++) {
            const currentModule = modules[moduleCtr];
            logger.log(`Creating module ${currentModule.name}`);
            await shellExecutor(npxCommand, [
                'ng',
                'generate',
                'module',
                currentModule.name,
                '--project=' + projectName,
                '--routing=true',
                '--route=' + currentModule.route,
                '--module=app'
            ], { 'cwd': path.join(fullWorkspace, projectName) });

            // Create Components
            for (let componentCtr = 0; componentCtr < currentModule.components.length; componentCtr++) {
                const currentComponent = currentModule.components[componentCtr];
                logger.log(`Creating component ${currentComponent.name} under ${currentModule.name}`);
                await shellExecutor(npxCommand, [
                    'ng',
                    'generate',
                    'component',
                    path.join(currentModule.name, currentComponent.name),
                    '--entryComponent=' + (currentModule.route === currentComponent.route),
                    '--project=' + projectName,
                    '--module=' + currentModule.name,
                    '--style=css',
                    '--prefix=' + currentModule.name
                ], { 'cwd': path.join(fullWorkspace, projectName) });
            }
        }
    }

    async insertAt(filePath, lineNumber, content) {
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
