class mat_sidenav {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatSidenavModule', link: '@angular/material/sidenav' }]
        },
            this.defaultProperties = {
                content: "",
                drawer: "",
                mode: "side"
            };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const styles = [];
        let content = "", drawer = "";
        if (props.content !== undefined) {
            content = await layoutBuilder(props.content);
            styles.push(content.style);
        }
        if (props.drawer !== undefined) {
            drawer = await layoutBuilder(props.drawer);
            styles.push(drawer.style);
        }
        return {
            "style": styles.join(" "), "html": `<mat-drawer-container><mat-drawer mode="${props.mode == undefined ? "side" : props.mode}" opened>${drawer.html}</mat-drawer><mat-drawer-content>${content.html}</mat-drawer-content></mat-drawer-container>`
        };
    }
}