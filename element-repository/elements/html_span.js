class html_span {
    constructor() {
        this.package = {};
        this.defaultProperties = { text: "Hello World" };
        this.template = this.template.bind(this);
    }

    async template(props) {
        return { "style": "", "html":`<span>${props.text}</span>`};
    }
}
