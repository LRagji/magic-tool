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
                "color": 'red',
                "guttersize": 2
            }]
        };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const contents = [];
        for (let contentCounter = 0; contentCounter < props.content.length; contentCounter++) {
            const content = props.content[contentCounter]
            const innerContent = await layoutBuilder(content.layout);
            contents.push(`<mat-grid-tile colspan="${content.colspan}" rowspan="${content.rowspan}" [ngStyle]="{background:'${content.color}'}" >${innerContent}</mat-grid-tile>`);
        }
        return `<mat-grid-list gutterSize="${props.guttersize}" cols="${props.cols}" rowHeight="${props.rowHeight}">${contents.join(' ')}</mat-grid-list>`;
    }
}
//module.exports = new matGrid();