class mat_button {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatButtonModule', link: '@angular/material/button' }]
        };
        this.defaultProperties = {
            content: "Hello World",
            disabled: false,
            buttontype: "raised"
        };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const content = await layoutBuilder(props.content);
        return { "style": "", "html": `<button mat-${props.buttontype == undefined ? '' : (props.buttontype + '-')}button ${props.disabled === true ? 'disabled' : ''} color="primary">${content.html}</button>` };
    }
}