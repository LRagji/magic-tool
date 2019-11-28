class bs_accordion {
    constructor() {
        this.package = {
            execute: ['npx ng add ngx-bootstrap --component accordion'],
            moduleImports: [{ moduleName: 'AccordionModule', link: 'ngx-bootstrap/accordion' }, { moduleName: 'CommonModule', link: '@angular/common' }]
        };
        this.defaultProperties = { text: 'No Name' };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return { "style": "", "html": `<accordion><accordion-group heading="${props.name}">This content is straight in the template.</accordion-group></accordion>` };
    }
}