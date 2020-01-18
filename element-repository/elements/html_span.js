class html_span {
    constructor() {
        this.package = {};
        this.defaultProperties = { text: "Hello World", type: "normal" };
        this.template = this.template.bind(this);
    }

    async template(props) {
        switch (props.type) {
            case "heading1":
                return { "style": "", "html": `<h1>${props.text}</h1>` };
            case "heading2":
                return { "style": "", "html": `<h2>${props.text}</h2>` };
            case "heading3":
                return { "style": "", "html": `<h3>${props.text}</h3>` };
            case "heading4":
                return { "style": "", "html": `<h4>${props.text}</h4>` };
            case "heading5":
                return { "style": "", "html": `<h5>${props.text}</h5>` };

            default:
                return { "style": "", "html": `<span>${props.text}</span>` };
        }
    }
}
