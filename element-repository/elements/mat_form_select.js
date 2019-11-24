class mat_form_select {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatSelectModule', link: '@angular/material/select' }]
        },
            this.defaultProperties = { label: 'Material Components', options: ["A", "B"] };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const label = `<mat-label>${props.label}</mat-label>`;
        let options = "";
        props.options.forEach(element => {
            options += `<mat-option value=${element}>${element}</mat-option>`
        });
        return `<mat-form-field>${props.label == undefined ? '' : label}<mat-select>${options}</mat-select></mat-form-field>`;
    }
}