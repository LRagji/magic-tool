const serviceNames = require('./service-names');
module.exports = class LayoutParser {
    constructor(locatorService) {
        this.parse = this.parse.bind(this);

        this._createHorizontalContainer = this._createHorizontalContainer.bind(this);
        this._createElements = this._createElements.bind(this);
        this._createElementContainer = this._createElementContainer.bind(this);
        this._locatorService = locatorService;
        this._repoElements = this._locatorService.get(serviceNames.elementsRepo);
        this._jsonReader = this._locatorService.get(serviceNames.jsonReader);
    }

    async parse(layouts, container) {
        const allLayouts = [];
        for (let layoutCounter = 0; layoutCounter < layouts.length; layoutCounter++) {
            const layout = layouts[layoutCounter];
            const hContainer = this._createHorizontalContainer(layout);
            const elementTemplates = await this._createElements(layout.elements);
            allLayouts.push(hContainer(elementTemplates));
        }

        switch (container) {
            case 'strech':
                return `<div class="container-fluid" > ${allLayouts.join(' ')} </div>`;
            case 'normal':
                return `<div class="container" > ${allLayouts.join(' ')} </div>`;
            default:
                return allLayouts.join(' ');
        }
    }

    _createHorizontalContainer(layout) {
        switch (layout.type) {
            case 'row-center':
                return content => `<div class="row justify-content-center">${content}</div>`;
            case 'row-left':
                return content => `<div class="row justify-content-start">${content}</div>`;
            case 'row-right':
                return content => `<div class="row justify-content-end">${content}</div>`;
            case 'row-justify':
                return content => `<div class="row justify-content-around">${content}</div>`;
            case 'row-sides':
                return `<div class="row justify-content-between"> </div>`;
            default:
                throw new Error("Layout Type is unknown:" + layout.type);
        }
    }

    _createElementContainer(element) {
        let cls = "col-auto";
        if (element.width !== undefined & !isNaN(element.width) & element.width < 13) {
            cls = "col-" + element.width;
        }
        return content => {
            return `<div class="${cls}" >${content}</div>`;
        }
    }

    async _createElements(elements) {
        let elementTemplates = [];
        for (let elementCounter = 0; elementCounter < elements.length; elementCounter++) {
            const element = elements[elementCounter];
            const container = this._createElementContainer(element);
            const repoElement = this._repoElements[element.name];
            if (repoElement === undefined) {
                elementTemplates.push('Unknown Element:' + element.name);
            }
            else {
                if (element.name === 'layout') {
                    const nestedLayoutObject = await this._jsonReader.readFile(element.properties.layout);
                    const nestLayout = await this.parse(nestedLayoutObject);
                    elementTemplates = elementTemplates.concat(container(nestLayout));
                }
                else {
                    const props = element.properties || repoElement.defaultProperties;
                    elementTemplates.push(container(repoElement.template(props)));
                }
            }
        };
        return elementTemplates.join(" ");
    }
}