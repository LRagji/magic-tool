class html_grid {
    constructor() {
        this.package = {
            execute: [],
            moduleImports: []
        };
        this.defaultProperties = {
            gridDef: {
                "600px": [
                    ['Abc', 'Abc', 'Abc'],
                    ['Abc', 'Abc', 'Abc']
                ], // Devices from 600px width and above
            },
            styleSuffix: undefined,
            horizontalAlignment: "space-evenly", //Possible values, space-around, space-between, center, start, end
            verticalAlignment: "space-evenly", //Possible values, space-around, space-between, center, start, end
            columnGap: "0px",
            rowGap: "0px",
            content: [{
                "name": "Abc",
                "layout": '',
                "color": 'red'
            }]
        };
        this.template = this.template.bind(this);
        this.style = this.style.bind(this);
    }

    async style(props) {
        const styleSuffix = props.styleSuffix == undefined ? Date.now().toString() : props.styleSuffix;
        let grid = "";
        Object.keys(props.gridDef).forEach((minWidth) => {
            let container = ".gc" + styleSuffix + " {display: grid;";
            let gridTemplate = props.gridDef[minWidth];
            container += "grid-template:" + gridTemplate.reduce((acc, cols) => acc + "'" + cols.join(' ') + "'", "") + ";";
            if (props.horizontalAlignment !== undefined) {
                container += "justify-content: " + props.horizontalAlignment + ";"
            }
            if (props.verticalAlignment !== undefined) {
                container += "align-content: " + props.verticalAlignment + ";"
            }
            if (props.columnGap !== undefined) {
                container += "grid-column-gap: " + props.columnGap + ";"
            }
            if (props.rowGap !== undefined) {
                container += "grid-row-gap: " + props.rowGap + ";"
            }
            container += "}";
            grid += `@media only screen and (min-width: ${minWidth}) { ${container} }`;
        });

        let itemStyles = [];
        if (props.content !== undefined) {
            itemStyles = props.content.map((itemProp, idx) => {
                let itemStyle = ".i" + idx + styleSuffix + "{";
                itemStyle += `grid-area: ${itemProp.name};`;
                if (itemProp.color !== undefined) itemStyle += ` background-color: ${itemProp.color};`;
                itemStyle += "}";
                return itemStyle;
            });
        }
        props.styleSuffix = styleSuffix;
        return grid + itemStyles.join('');
    }

    async template(props, layoutBuilder) {
        const styles = [];
        styles.push(await this.style(props));
        let items = "";
        for (let idx = 0; idx < props.content.length; idx++) {
            const currentContent = props.content[idx];
            const content = await layoutBuilder(currentContent.layout);
            items += `<div class="i${idx + props.styleSuffix}" > ${content.html} </div>`;
            styles.push(content.style);
        }
        return { "html": `<div class="gc${props.styleSuffix}"> ${items} </div>`, "style": styles.join(" ") };
    }
}