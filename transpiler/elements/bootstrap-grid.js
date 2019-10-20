class bootstrapGrid {

    constructor() {
        this.package = {
            execute: ['npx ng add ngx-bootstrap','echo HelloWorld'],
            moduleImports: []
        };
        this.defaultProperties = { rows: [{ type: "", layout: '' }], container: 'normal' };
        this.template = this.template.bind(this);
        this._createElementContainer = this._createElementContainer.bind(this);
        this._createHorizontalContainer = this._createHorizontalContainer.bind(this);
    }

    async template(props, layoutBuilder) {
        const allLayouts = [];
        for (let rowCounter = 0; rowCounter < props.rows.length; rowCounter++) {
            const row = props.rows[rowCounter];
            const hContainer = this._createHorizontalContainer(row);
            const columns = []
            for (let colCtr = 0; colCtr < row.elements.length; colCtr++) {
                const element = row.elements[colCtr];
                const elementContainer = this._createElementContainer(element);
                const elementTemplates = await layoutBuilder(element.layout);
                columns.push(elementContainer(elementTemplates));

            }
            allLayouts.push(hContainer(columns.join(' ')));
        }

        switch (props.container) {
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
                return content => `<div class="row justify-content-between">${content}</div>`;
            default:
                return content => `<div style='bgcolor:red'>${content}</div>`;
        }
    }

    _createElementContainer(element) {
        let cls = "col-auto";
        if (element.width !== undefined & !isNaN(element.width) & element.width < 13) {
            cls = "col-" + element.width;
        }
        return content => {
            return `<div class="${cls}" [ngStyle]="{background:'${element.color}'}" >${content}</div>`;
        }
    }
}

module.exports = new bootstrapGrid();