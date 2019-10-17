const serviceNames = require('./service-names');
module.exports = class LayoutParser {
    constructor(locatorService) {
        this.parse = this.parse.bind(this);

        //this._createHorizontalContainer = this._createHorizontalContainer.bind(this);
        this._createElements = this._createElements.bind(this);
        this._createElementContainer = this._createElementContainer.bind(this);
        this._locatorService = locatorService;
        this._repoElements = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);
        this._toolRootDirectory = this._locatorService.get(serviceNames.toolRootDirectory);
        this._path = this._locatorService.get(serviceNames.pathService);
        this._constructLayout = this._constructLayout.bind(this);
    }

    async parse(elements) {
        // const allLayouts = [];
        // for (let layoutCounter = 0; layoutCounter < layouts.length; layoutCounter++) {
        //     const layout = layouts[layoutCounter];
        //const hContainer = this._createHorizontalContainer(layout);
        return this._createElements(elements);
        //     allLayouts.push(hContainer(elementTemplates));
        // }

        // switch (container) {
        //     case 'strech':
        //         return `<div class="container-fluid" > ${allLayouts.join(' ')} </div>`;
        //     case 'normal':
        //         return `<div class="container" > ${allLayouts.join(' ')} </div>`;
        //     default:
        //return elementTemplates.join(' ');
        //}
    }

    // _createHorizontalContainer(layout) {
    //     switch (layout.type) {
    //         case 'row-center':
    //             return content => `<div class="row justify-content-center">${content}</div>`;
    //         case 'row-left':
    //             return content => `<div class="row justify-content-start">${content}</div>`;
    //         case 'row-right':
    //             return content => `<div class="row justify-content-end">${content}</div>`;
    //         case 'row-justify':
    //             return content => `<div class="row justify-content-around">${content}</div>`;
    //         case 'row-sides':
    //             return content => `<div class="row justify-content-between">${content}</div>`;
    //         default:
    //             throw new Error("Layout Type is unknown:" + layout.type);
    //     }
    // }

    _createElementContainer(element) {
        if (element.bootstrapWrapper !== undefined) {
            let cls = "col-auto";
            if (element.bootstrapWrapper.colwidth !== undefined & !isNaN(element.bootstrapWrapper.colwidth) & element.bootstrapWrapper.colwidth < 13) {
                cls = "col-" + element.bootstrapWrapper.colwidth;
            }
            return content => {
                return `<div class="${cls}" >${content}</div>`;
            }
        }

        return `${content}`;
    }

    async _createElements(elements) {
        let elementTemplates = [];
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            const container = this._createElementContainer(element);
            const repoElement = this._repoElements[element.type];
            if (repoElement === undefined) {
                elementTemplates.push('Unknown Element:' + element.type);
            }
            else {
                // if (element.name === 'layout') {
                //     const nestLayout = await this._constructLayout(this._path.join(this._toolRootDirectory, element.properties.layout));
                //     elementTemplates = elementTemplates.concat(container(nestLayout));
                // }
                // else {
                const props = element.properties || repoElement.defaultProperties;
                const elementInstance = await repoElement.template(props, this._constructLayout);
                elementTemplates.push(container(elementInstance));
                // }
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