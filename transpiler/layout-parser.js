const serviceNames = require('./service-names');
module.exports = class LayoutParser {
    constructor(locatorService) {
        this.parse = this.parse.bind(this);

        this._locatorService = locatorService;
        this._repoElements = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);
        this._toolRootDirectory = this._locatorService.get(serviceNames.toolRootDirectory);
        this._path = this._locatorService.get(serviceNames.pathService);
        
        this._constructLayout = this._constructLayout.bind(this);
    }

    async parse(elements) {
        let elementTemplates = [];
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            const repoElement = this._repoElements[element.type];
            if (repoElement === undefined) {
                elementTemplates.push('Unknown Element:' + element.type);
            }
            else {
                const props = element.properties || repoElement.defaultProperties;
                const elementInstance = await repoElement.template(props, this._constructLayout);
                elementTemplates.push(elementInstance);
            }
        };
        return elementTemplates.join(" ");
    }

    async _constructLayout(layoutFile) {
        if (layoutFile == undefined || layoutFile === '') {
            return '';
        }
        else {
            const nestedLayoutObject = await this._jsonReader.readFile(this._path.join(this._toolRootDirectory, layoutFile));
            return this.parse(nestedLayoutObject);
        }
    }
}