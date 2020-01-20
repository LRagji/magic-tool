const serviceNames = require('./service-names');
const spawn = require('child_process').spawn;
const createSymlink = require('create-symlink');
const path = require('path');
const fs = require('fs');

module.exports = class Utilities {

    constructor(dependencyContainer) {
        this._logger = dependencyContainer.get(serviceNames.loggerService);
        this._elementRepoClient = dependencyContainer.get(serviceNames.ElementsRepoClient);
        this._executeShell = this._executeShell.bind(this);
        this._installElement = this._installElement.bind(this);
        this.layoutParse = this.layoutParse.bind(this);
        this._npmInstall = this._npmInstall.bind(this);
        this._fileExists = this._fileExists.bind(this);
        this._fileWrite = this._fileWrite.bind(this);
        this._fileAppend = this._fileAppend.bind(this);
        this.createModule = this.createModule.bind(this);
        this._fileRead = this._fileRead.bind(this);
        this._addImports = this._addImports.bind(this);
        this._capitalizeAsAngular = this._capitalizeAsAngular.bind(this);


        this.npxCommand = 'npx';
        this.npmCommand = 'npm';
    }

    async _executeShell(command, args, options) {
        return new Promise((acc, rej) => {
            options.shell = true;
            const cmd = spawn(command, args, options);
            cmd.stdout.on('data', data => {
                this._logger.dim(`${data}`);
            });

            cmd.stderr.on('data', data => {
                this._logger.dim(`${data}`);
            });

            cmd.on('error', err => {
                this._logger.dim(`${err}`);
                rej(err);
            });

            cmd.on('exit', (code, signal) => {
                if (code === 0) {
                    acc(code);
                } else {
                    rej({ 'code': code, 'signal': signal });
                }
                cmd.stdin.end();
            });
        });
    }

    async _npmInstall(projectPath, schematicPackagePath, cacheCopy = undefined) {
        if (cacheCopy !== undefined) {
            await createSymlink(cacheCopy, path.join(projectPath + "/node_modules"), { type: 'junction' });
        }
        else {
            //RUN Complete NPM Install
            await this._executeShell(this.npmCommand, [
                'install',
                '--verbose'
            ], { 'cwd': projectPath });
        }

        //Do schematics install
        await this._executeShell(this.npmCommand, [
            'install',
            schematicPackagePath,
        ], { 'cwd': projectPath });
    }

    _fileExists(path) {
        return fs.existsSync(path);
    }

    _fileWrite(filepath, content) {
        const filename = path.basename(filepath);
        const directory = filepath.replace(filename, '');
        fs.mkdirSync(directory, { recursive: true });
        fs.writeFileSync(path.join(directory, filename), content);
    }

    _fileAppend(filepath, content) {
        fs.appendFileSync(filepath, content);
    }

    _fileRead(filepath) {
        if (this._fileExists(filepath)) {
            return fs.readFileSync(filepath);
        }
        else {
            return undefined;
        }
    }

    async layoutParse(elements, installedElements, modulePath, projectName, executeDirectory, layoutResolver) {
        let elementTemplates = [];
        let elementStyles = [];
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            let repoElement = await this._elementRepoClient.getInstanceOfElement(element.type);
            if (repoElement === undefined) {
                let componentName = projectName + '-' + element.type;
                this._logger.log(`Generating library ${componentName}`);
                repoElement = { type: element.type };
                repoElement.package = {
                    execute: ['npx ng generate library ' + componentName],
                    moduleImports: [{ moduleName: this._capitalizeAsAngular(componentName) + 'Module', link: `projects/${componentName}/src/public-api` }]
                }
                repoElement.defaultProperties = {};
                repoElement.template = (props, layoutBuilder) => ({ "style": "", "html": `<lib-${componentName}> </lib-${componentName}>` });
            }

            repoElement.type = element.type;
            if (installedElements.indexOf(element.type) === -1) {
                await this._installElement(repoElement, executeDirectory, projectName);
                installedElements.push(element.type);
            }
            await this._addImports(repoElement, modulePath, executeDirectory);
            const props = element.properties || repoElement.defaultProperties;
            const elementInstance = await repoElement.template(props, async (layoutName) => await this.layoutParse(layoutResolver(layoutName), installedElements, modulePath, projectName, executeDirectory, layoutResolver));
            elementTemplates.push(elementInstance.html);
            elementStyles.push(elementInstance.style);

        };
        return { "html": elementTemplates.join(" "), "style": elementStyles.join(" ") };
    }

    _capitalizeAsAngular(name) {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let idx = name.indexOf("-");
        let partA = name.slice(0, idx);
        idx++;
        return partA + name.charAt(idx).toUpperCase() + name.slice((idx+1), name.length);
    }

    async _installElement(element, executeDirectory, projectName) {
        const moduleExecutions = element.package.execute || [];
        for (let exeCounter = 0; exeCounter < moduleExecutions.length; exeCounter++) {
            const elementShell = moduleExecutions[exeCounter];
            this._logger.log(`Executing ${elementShell} for element:${element.type}`);
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
            await this._executeShell(command, brokenCommand, { 'cwd': executeDirectory });
        }

        const styleDependencies = element.package.styles || [];
        for (let dependencyCtr = 0; dependencyCtr < styleDependencies.length; dependencyCtr++) {
            const style = styleDependencies[dependencyCtr];
            this._logger.log(`Refering style: ${style} for element: ${element.type}`);
            await this._executeShell(this.npxCommand, [
                'ng',
                'g',
                "ng-utils:add-styles",
                `--style-path=${style}`,
                `--project=${projectName}`
            ], { 'cwd': executeDirectory });
        }
    }

    async _addImports(element, modulePath, executeDirectory) {
        const moduleDependencies = element.package.moduleImports || [];
        for (let dependencyCtr = 0; dependencyCtr < moduleDependencies.length; dependencyCtr++) {
            const dependency = moduleDependencies[dependencyCtr];
            this._logger.log(`Adding Imports: ${dependency.moduleName} for element: ${element.type}`);
            await this._executeShell(this.npxCommand, [
                'ng',
                'g',
                "ng-utils:add-imports",
                `--module-path=${modulePath}`,
                `--component-name=${dependency.moduleName}`,
                `--component-path=${dependency.link}`
            ], { 'cwd': executeDirectory });
        }

    }

    async createModule(applicationName, workspaceDirectory, currentModule) {
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

    }

    async createApplication(applicationName, workspaceDirectory, npmCacheDir, schematicPath, enableDocker) {
        const applicationDir = path.join(workspaceDirectory, applicationName);
        if (this._fileExists(applicationDir)) {
            throw new Error("Application" + applicationDir + " already exists.");
        }
        //Angular CLI
        await this._executeShell(this.npxCommand, [
            '-p',
            '@angular/cli',
            'ng',
            'new',
            applicationName,
            '--commit=false',
            '--interactive=false',
            '--skipInstall=true',
            '--skipGit=true',
            '--routing=true',
            '--style=css',
            '--verbose=true'
        ], { 'cwd': workspaceDirectory });
        //NPM Install
        await this._npmInstall(applicationDir, schematicPath, npmCacheDir);
        //Clear Index Page
        this._fileWrite(path.join(applicationDir, 'src/app/app.component.html'), `<router-outlet></router-outlet>`);
        //Docker
        if (enableDocker === true) {
            //Add command in package.jason
            let projPackage = JSON.parse(this._fileRead(path.join(applicationDir, 'package.json')));
            projPackage.scripts["dockerbuild"] = "ng build --prod && docker build -t sds:localbuild . && docker image inspect " + applicationName.toLowerCase() + ":localbuild --format='{{.Size}}'";
            projPackage.scripts["dockerrun"] = "docker run --name debugDocker -d -p 4500:80 " + applicationName.toLowerCase() + ":localbuild";
            this._fileWrite(path.join(applicationDir, 'package.json'), JSON.stringify(projPackage));

            //Create Docker File
            this._fileWrite(path.join(applicationDir, 'Dockerfile'),
                `FROM nginx:mainline-alpine
                COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
                COPY ./dist/subsea-drilling-systems /usr/share/nginx/html/`);

            //Create Nginx config
            this._fileWrite(path.join(applicationDir, 'nginx/default.conf'),
                `server {
                listen       80;
                server_name  localhost;
                gzip on;
                gzip_comp_level 5;
                gzip_types text/plain text/css application/javascript application/x-javascript text/xml application/xml application/rss+xml text/javascript image/x-icon image/bmp image/svg+xml;
                gzip_proxied no-cache no-store private expired auth;
                gzip_min_length 1000;
                
                location / {
                    root   /usr/share/nginx/html;
                    index  index.html index.htm;
                    try_files $uri $uri/ /index.html;
                }
            }`);
        }

    }
}