class mat_card {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatCardModule', link: '@angular/material/card' }]
        },
            this.defaultProperties = {
                header: "",
                actions: "",
                content: "",
                title: "Title",
                subTitle: "Sub title"
            };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        const styles = [];
        let content = null, header = null, actions = null;
        if (props.content !== undefined) {
            content = await layoutBuilder(props.content);
            content.html = `<mat-card-content>${content.html}</mat-card-content>`;
            styles.push(content.style);
        }
        if (props.header !== undefined) {
            header = await layoutBuilder(props.header);
            if (props.title !== undefined) header.html += `<mat-card-title>${props.title}</mat-card-title>`;
            if (props.subTitle !== undefined) header.html += `<mat-card-subtitle>${props.subTitle}</mat-card-subtitle>`
            header.html = `<mat-card-header>${header.html}</mat-card-header>`;
            styles.push(header.style);
        }
        if (props.actions !== undefined) {
            actions = await layoutBuilder(props.actions);
            actions.html = `<mat-card-actions>${actions.html}</mat-card-actions>`;
            styles.push(actions.style);
        }

        return {
            "style": styles.join(" "), "html": `<mat-card> ${header != undefined ? header.html : ""} ${content != undefined ? content.html : ""} ${actions != undefined ? actions.html : ""}</mat-card>`
        };
    }
}