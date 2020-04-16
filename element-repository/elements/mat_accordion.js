class mat_accordion {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatExpansionModule', link: '@angular/material/expansion' }]
        },
            this.defaultProperties = {
                panels: [{
                    header: "Header",
                    content: ""
                }],
                disabled: false,
                buttontype: "raised"
            };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        let panels = { styles: "", html: "" };
        for (let idx = 0; idx < props.panels.length; idx++) {
            const panelProps = props.panels[idx];
            const content = await layoutBuilder(panelProps.content);
            let panel = "<mat-expansion-panel>";
            panel += (panelProps.header !== undefined ? (`<mat-expansion-panel-header><mat-panel-title>${panelProps.header}</mat-panel-title></mat-expansion-panel-header>`) : "");
            panel += content.html;
            panel += "</mat-expansion-panel>";
            panels.html += " " + panel;
            panels.styles += " " + content.style;
        }

        return {
            "style": panels.styles, "html": `<mat-accordion>${panels.html}</mat-accordion>`
        };
    }
}