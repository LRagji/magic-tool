class mat_button {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatButtonModule', link: '@angular/material/button' }]
        };
        this.defaultProperties = {
            text: "Hello World"
        };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return `<button mat-raised-button color="primary">${props.text}</button>`;
    }
}