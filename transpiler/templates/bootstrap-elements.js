module.exports = {
    button: {
        installName: "buttons",
        dependencies: [{ moduleName: 'ButtonsModule', link: `ngx-bootstrap/buttons` }],
        defaultProperties: { text: 'No Name' },
        template: (props) => {
            return `<button type="button" class="btn btn-primary">${properties.text}</button>`;
        }
    }
}