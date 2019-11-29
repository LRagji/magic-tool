class mat_tab {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatTabsModule', link: '@angular/material/tabs' }]
        },
            this.defaultProperties = {
                tabs: [{
                    name: "Tab1",
                    content: ""
                }, {
                    name: "Tab2",
                    content: ""
                },
                {
                    name: "Tab3",
                    content: ""
                }]
            };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        let tabsMarkUp = "";
        const styles = [];
        for (let index = 0; index < props.tabs.length; index++) {
            const tab = props.tabs[index];
            const content = await layoutBuilder(tab.content);
            tabsMarkUp += `<mat-tab label="${tab.name}"> ${content.html} </mat-tab>`;
            styles.push(content.style);
        }
        return { "style": styles.join(" "), "html": `<mat-tab-group>${tabsMarkUp}</mat-tab-group>` };
    }
}