// Copyright © 2019 Laukik Ragji, a GE company, LLC.  All rights reserved
const executorService = 'shell';
const loggerService = 'logger';
const npxCommand = 'npx';
const npmCommand = 'npm';
const path = require('path');

module.exports = class angularBuilder {

    constructor(locatorService) {
        this._locatorService = locatorService;
    }

    async createProject(config) {
        const shellExecutor = this._locatorService.get(executorService);
        const fullWorkspace = config.workspace;
        const projectName = config.name;
        const cmdOptions = { 'cwd': fullWorkspace };
        const modules = config.modules;
        const logger = this._locatorService.get(loggerService);

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

};
