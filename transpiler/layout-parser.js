module.exports = class LayoutParser {
    constructor() {
        this.parse = this.parse.bind(this);
    }

    async parse(layout) {
        return `<p>${JSON.stringify(layout).replace('{',"'{'").replace('}',"'}'")}</p>`;
    }

}