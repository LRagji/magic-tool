class mat_grid_list {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatGridListModule', link: '@angular/material/grid-list' }]
        };
        this.defaultProperties = {
            cols: 12, rowHeight: "4:3", content: [{
                "rowspan": 1,
                "colspan": 1,
                "layout": '',
                "color": 'red'
            }]
        };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const contents = [];
        for (let contentCounter = 0; contentCounter < props.content.length; contentCounter++) {
            const content = props.content[contentCounter]
            const innerContent = await layoutBuilder(content.layout);
            const colorAttribute = `[ngStyle]="{background:'${content.color}'}"`;
            contents.push(`<mat-grid-tile colspan="${content.colspan}" rowspan="${content.rowspan}" ${content.color == undefined ? '' : colorAttribute} >${innerContent}</mat-grid-tile>`);
        }
        const colorAttribute = `[ngStyle]="{background:'${props.color}'}"`;
        return `<mat-grid-list cols="${props.cols}" gutterSize="${props.guttersize}" rowHeight="${props.rowHeight}" ${props.color == undefined ? '' : colorAttribute} >${contents.join(' ')}</mat-grid-list>`;
    }
}