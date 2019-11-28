class bs_button {
    constructor() {
        this.package = {
            execute: ['npx ng add ngx-bootstrap --component buttons'],
            moduleImports: [{ moduleName: 'ButtonsModule', link: 'ngx-bootstrap/buttons' }]
        };
        this.defaultProperties = { text: 'No Name' };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return { "style": "", "html":`<button type="button" class="btn btn-primary">${props.text}</button>`};
    }
}