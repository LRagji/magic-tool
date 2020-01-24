class html_hr {
    constructor() {
        this.package = {};
        this.defaultProperties = {};
        this.template = this.template.bind(this);
    }

    async template(props) {
        return { "style": "", "html":`<hr/>`};
    }
}
