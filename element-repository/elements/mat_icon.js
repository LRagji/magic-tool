class mat_icon {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatIconModule', link: '@angular/material/icon' }]
        };
        this.defaultProperties = {
            icon: "home",
            label: "Example home icon"
        };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return {
            "style": "", "html": `<mat-icon aria-hidden="false" aria-label="${props.label}">${props.icon}</mat-icon>`
        };
    }
}