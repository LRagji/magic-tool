class HtmlSpan {
    constructor() {
        this.package = {};
        this.defaultProperties = { text: "Hello World" };
        this.template = this.template.bind(this);
    }

    async template(props) {
        return `<span>${props.text}</span>`;
    }
}

module.exports = new HtmlSpan();