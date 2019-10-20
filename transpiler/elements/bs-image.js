class BsImage {
    constructor() {
        this.package = {
            execute: ['npx ng add ngx-bootstrap','echo I-am-Image'],
            moduleImports: []
        };
        this.defaultProperties = { imageSource: 'https://picsum.photos/1024/300', altText: 'Lorem Picsum' };
        this.template = this.template.bind(this);

    }
    
    async template(props) {
        return `<img src="${props.imageSource}" class="img-fluid" alt="${props.altText}">`;
    }
}

module.exports = new BsImage();