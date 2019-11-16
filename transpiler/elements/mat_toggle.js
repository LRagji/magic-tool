class mat_toggle {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatSlideToggleModule', link: '@angular/material/slide-toggle' }]
        },
        this.defaultProperties = { text: 'Material Components' };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return `<mat-slide-toggle>${props.text}</mat-slide-toggle>`;
    }
}