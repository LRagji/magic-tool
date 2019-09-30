module.exports = class LayoutParser {
    constructor(repoElements) {
        this.parse = this.parse.bind(this);

        this._createHorizontalContainer = this._createHorizontalContainer.bind(this);
        this._createElements = this._createElements.bind(this);
        this._createElementContainer = this._createElementContainer.bind(this);
        this._repoElements = repoElements;
    }

    parse(layouts, container) {
        const allLayouts = [];
        layouts.forEach(layout => {
            const hContainer = this._createHorizontalContainer(layout);
            const elementTemplates = this._createElements(layout.elements);
            allLayouts.push(hContainer(elementTemplates));
        });

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

    _createElements(elements) {
        const elementTemplates = [];
        elements.forEach((element) => {
            const container = this._createElementContainer(element);
            const repoElement = this._repoElements[element.name];
            if (repoElement === undefined) {
                elementTemplates.push('Unknown Element:' + element.name);
            }
            else {
                const props = element.properties || repoElement.defaultProperties;
                elementTemplates.push(container(repoElement.template(props)));
            }
        });
        return elementTemplates.join(" ");
    }
}