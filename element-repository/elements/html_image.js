class html_image {
    constructor() {
        this.package = {
            execute: [],
            moduleImports: []
        };
        this.defaultProperties = { imageSource: 'https://picsum.photos/1024/300', altText: 'Lorem Picsum', height: "100%", width: "100%" };
        this.template = this.template.bind(this);

    }

    async template(props) {
        const inlineStyleAttributre = `[ngStyle]="{height:'${props.height}',width:'${props.width}'}"`;
        return { "style": "", "html": `<img src="${props.imageSource}" alt="${props.altText}" ${inlineStyleAttributre} >` };
    }
}