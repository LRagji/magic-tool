const serviceNames = require('./service-names');
const npxCommand = 'npx';
module.exports = class LayoutParser {
    constructor(locatorService) {
        this.parse = this.parse.bind(this);

        this._locatorService = locatorService;
        this._repoElements = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);
        this._toolRootDirectory = this._locatorService.get(serviceNames.toolRootDirectory);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._logger = this._locatorService.get(serviceNames.loggerService);
        this._shellExecutor = this._locatorService.get(serviceNames.executorService);

        this._constructLayout = this._constructLayout.bind(this);
        this._installElement = this._installElement.bind(this);
    }

    async parse(elements, installedElements, currentModule, projectName, executeDirectory) {
        let elementTemplates = [];
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            const repoElement = this._repoElements[element.type];
            if (repoElement === undefined) {
                elementTemplates.push('Unknown Element:' + element.type);
            }
            else {
                if (installedElements.indexOf(element.type) === -1) {
                    //const executeDirectory = this._path.join(fullWorkspace, projectName);
                    repoElement.type = element.type;
                    await this._installElement(repoElement, currentModule, executeDirectory, projectName);
                    installedElements.push(element.type);
                }
                const props = element.properties || repoElement.defaultProperties;
                const elementInstance = await repoElement.template(props, (filepath) => this._constructLayout(filepath, installedElements, currentModule, projectName, executeDirectory));
                elementTemplates.push(elementInstance);
            }
        };
        return elementTemplates.join(" ");
    }

    async _installElement(element, currentModule, executeDirectory, projectName) {
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
            await this._shellExecutor(command, brokenCommand, { 'cwd': executeDirectory });
        }

        const moduleDependencies = element.package.moduleImports || [];
        for (let dependencyCtr = 0; dependencyCtr < moduleDependencies.length; dependencyCtr++) {
            const dependency = moduleDependencies[dependencyCtr];
            this._logger.log(`Adding Imports: ${dependency.moduleName} for element: ${element.type}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-imports",
                `--module-path=${currentModule.path}`,
                `--component-name=${dependency.moduleName}`,
                `--component-path=${dependency.link}`
            ], { 'cwd': executeDirectory });
        }

        const styleDependencies = element.package.styles || [];
        for (let dependencyCtr = 0; dependencyCtr < styleDependencies.length; dependencyCtr++) {
            const style = styleDependencies[dependencyCtr];
            this._logger.log(`Refering style: ${style} for element: ${element.type}`);
            await this._shellExecutor(npxCommand, [
                'ng',
                'g',
                "ng-utils:add-styles",
                `--style-path=${style}`,
                `--project=${projectName}`
            ], { 'cwd': executeDirectory });
        }
    }

    async _constructLayout(layoutFile, installedElements, currentModule, projectName,executeDirectory) {
        if (layoutFile == undefined || layoutFile === '') {
            return '';
        }
        else {
            const nestedLayoutObject = await this._jsonReader.readFile(this._path.join(this._toolRootDirectory, layoutFile));
            return this.parse(nestedLayoutObject, installedElements, currentModule, projectName, executeDirectory);
        }
    }
}