const requireFromString = require('require-from-string');
const rp = require('request-promise-native');
const fs = require('fs');
const path = require('path');

//TODO: This is the baddest thing done, the correct version of the same will include be to move to dynamic imports of es6
function dynamicLoad(filepath) {
    let data = fs.readFileSync(filepath, { encoding: "utf8" });
    let exportSyntax = "\r\n module.exports = new " + path.basename(filepath, '.js') + "();";
    return requireFromString(data + exportSyntax);
}

module.exports = class ElementRepoClient {

    constructor(repoUrl) {
        this._cache = new Map();
        this._repoUrl = repoUrl;
        this.getInstanceOfElement = this.getInstanceOfElement.bind(this);
        this._fetchElementFromRepo = this._fetchElementFromRepo.bind(this);
    }

    async getInstanceOfElement(elementName, refreshCache = false) {
        let elementInstance = this._cache[elementName];
        if (elementInstance === undefined || refreshCache === true) {
            let data = await this._fetchElementFromRepo(elementName);
            if (data === "") {
                return undefined;
            }
            let exportSyntax = "\r\n module.exports = new " + elementName + "();";
            elementInstance = requireFromString(data + exportSyntax);
            this._cache[elementName] = elementInstance;
        }
        return elementInstance;
    }

    async _fetchElementFromRepo(elementName) {
        let returnElement = "";
        const fetchURL = URL.parse(this._repoUrl + '/v1/elements/' + elementName);
        console.log(fetchURL);
        returnElement = await rp(fetchURL);
        return returnElement;
    }
}

// module.exports = {
//     toggle: {
//         package: {
//             execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
//             moduleImports: [{ moduleName: 'MatSlideToggleModule', link: '@angular/material/slide-toggle' }]
//         },
//         defaultProperties: { text: 'Material Components' },
//         template: async (props) => {
//             return `<mat-slide-toggle>${props.text}</mat-slide-toggle>`;
//         }
//     },
//     "html-span": require("./html-span"),
//     gridlist: dynamicLoad('/Users/laukikragji/Documents/Git/Local/magic-tool/transpiler/elements/mat_grid_list.js'),
//     mat_button: dynamicLoad('/Users/laukikragji/Documents/Git/Local/magic-tool/transpiler/elements/mat_button.js'),
//     button: {
//         package: {
//             execute: ['npx ng add ngx-bootstrap --component buttons'],
//             moduleImports: [{ moduleName: 'ButtonsModule', link: 'ngx-bootstrap/buttons' }]
//         },
//         defaultProperties: { text: 'No Name' },
//         template: async (props) => {
//             return `<button type="button" class="btn btn-primary">${props.text}</button>`;
//         }
//     },
//     accordion: {
//         package: {
//             execute: ['npx ng add ngx-bootstrap --component accordion'],
//             moduleImports: [{ moduleName: 'AccordionModule', link: 'ngx-bootstrap/accordion' }, { moduleName: 'CommonModule', link: '@angular/common' }]
//         },
//         defaultProperties: { name: 'No Name' },
//         template: async (props) => {
//             return `<accordion>
//             <accordion-group heading="${props.name}">
//               This content is straight in the template.
//             </accordion-group>
//             </accordion>`;
//         }
//     },
//     "bs-image": require('./bs-image'),
//     "bs-grid": require('./bootstrap-grid'),
//     label: {
//         package: {
//             execute: ['npx ng add ngx-bootstrap'],
//             moduleImports: []
//         },
//         defaultProperties: { text: 'this is text', bold: false, italic: false, turncate: false, wrap: false, lowercase: false, uppercase: false, align: 'left' },
//         template: async (props) => {
//             let cls = "";
//             if (props.bold === true) {
//                 cls += 'font-weight-bold ';
//             }
//             if (props.italic === true) {
//                 cls += 'font-weight-italic ';
//             }

//             if (props.turncate === props.wrap === true) {
//                 cls += 'd-inline-block text-truncate ';
//             }
//             else if (props.turncate === true) {
//                 cls += 'd-inline-block text-truncate ';
//             }
//             else if (props.wrap === false) {
//                 cls += 'text-nowrap ';
//             }

//             if (props.lowercase === true) {
//                 cls += 'text-lowercase ';
//             }
//             if (props.uppercase === true) {
//                 cls += 'text-uppercase ';
//             }

//             cls += `text-${props.align} `;

//             return `<span class="${cls}">
//                     ${props.text}
//                     </span>`;
//         }
//     }
// }

// const elementsToModuleDependencies = {
//     accordion: [{ moduleName: 'AccordionModule', link: `ngx-bootstrap/accordion` }, { moduleName: 'CommonModule', link: '@angular/common' }],
//     alerts: [{ moduleName: 'AlertModule', link: `ngx-bootstrap/alert` }],
//     buttons: [{ moduleName: 'ButtonsModule', link: `ngx-bootstrap/buttons` }],
//     carousel: [{ moduleName: 'CarouselModule', link: `ngx-bootstrap/carousel` }],
//     collapse: [{ moduleName: 'CollapseModule', link: `ngx-bootstrap/collapse` }, { moduleName: 'CommonModule', link: '@angular/common' }],
//     datepicker: [{ moduleName: 'BsDatepickerModule', link: `ngx-bootstrap/datepicker` }, { moduleName: 'CommonModule', link: '@angular/common' }],
//     dropdowns: [{ moduleName: 'BsDropdownModule', link: `ngx-bootstrap/dropdown` }],
//     modals: [{ moduleName: 'ModalModule', link: `ngx-bootstrap/modal` }],
//     pagination: [{ moduleName: 'PaginationModule', link: `ngx-bootstrap/pagination` }],
//     popover: [{ moduleName: 'PopoverModule', link: `ngx-bootstrap/popover` }],
//     progressbar: [{ moduleName: 'ProgressbarModule', link: `ngx-bootstrap/progressbar` }],
//     rating: [{ moduleName: 'RatingModule', link: `ngx-bootstrap/rating` }],
//     sortable: [{ moduleName: 'SortableModule', link: `ngx-bootstrap/sortable` }],
//     tabs: [{ moduleName: 'TabsModule', link: `ngx-bootstrap/tabs` }],
//     timepicker: [{ moduleName: 'TimepickerModule', link: `ngx-bootstrap/timepicker` }],
//     tooltip: [{ moduleName: 'TooltipModule', link: `ngx-bootstrap/tooltip` }],
//     typeahead: [{ moduleName: 'TypeaheadModule', link: `ngx-bootstrap/typeahead` }, { moduleName: 'CommonModule', link: '@angular/common' }]
// };