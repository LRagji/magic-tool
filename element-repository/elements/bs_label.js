class bs_label {
    constructor() {
        this.package = {
            execute: ['npx ng add ngx-bootstrap'],
            moduleImports: []
        };
        this.defaultProperties = { text: 'this is text', bold: false, italic: false, turncate: false, wrap: false, lowercase: false, uppercase: false, align: 'left' };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        let cls = "";
        if (props.bold === true) {
            cls += 'font-weight-bold ';
        }
        if (props.italic === true) {
            cls += 'font-weight-italic ';
        }

        if (props.turncate === props.wrap === true) {
            cls += 'd-inline-block text-truncate ';
        }
        else if (props.turncate === true) {
            cls += 'd-inline-block text-truncate ';
        }
        else if (props.wrap === false) {
            cls += 'text-nowrap ';
        }

        if (props.lowercase === true) {
            cls += 'text-lowercase ';
        }
        if (props.uppercase === true) {
            cls += 'text-uppercase ';
        }

        cls += `text-${props.align} `;

        return {
            "style": "", "html": `<span class="${cls}">
                            ${props.text}
                            </span>`};
    }
}