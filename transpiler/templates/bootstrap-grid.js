class bootstrapGrid {
    
    constructor() {
        this.package = {
            execute: 'ng add ngx-bootstrap',
            moduleImports: []
        };
        this.defaultProperties = { rows: [{ type: "", layout: '' }], container: 'normal' };
        this.template = this.template.bind(this);

        this._createHorizontalContainer = this._createHorizontalContainer.bind(this);
    }

    async template(props, layoutBuilder) {
        const allLayouts = [];
        for (let rowCounter = 0; rowCounter < props.rows.length; rowCounter++) {
            const row = props.rows[rowCounter];
            const hContainer = this._createHorizontalContainer(row);
            const elementTemplates = await layoutBuilder(row.layout);
            allLayouts.push(hContainer(elementTemplates));
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
}

module.exports = new bootstrapGrid();