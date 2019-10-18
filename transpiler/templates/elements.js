module.exports = {
    toggle: {
        package: {
            execute: 'ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true',
            moduleImports: [{ moduleName: 'MatSlideToggleModule', link: '@angular/material/slide-toggle' }]
        },
        defaultProperties: { text: 'Material Components' },
        template: async (props) => {
            return `<mat-slide-toggle>${props.text}</mat-slide-toggle>`;
        }
    },
    gridlist: require('./mat-grid-list'),
    button: {
        package: {
            execute: 'ng add ngx-bootstrap --component buttons',
            moduleImports: [{ moduleName: 'ButtonsModule', link: 'ngx-bootstrap/buttons' }]
        },
        defaultProperties: { text: 'No Name' },
        template: async (props) => {
            return `<button type="button" class="btn btn-primary">${props.text}</button>`;
        }
    },
    accordion: {
        package: {
            execute: 'ng add ngx-bootstrap --component accordion',
            moduleImports: [{ moduleName: 'AccordionModule', link: 'ngx-bootstrap/accordion' }, { moduleName: 'CommonModule', link: '@angular/common' }]
        },
        defaultProperties: { name: 'No Name' },
        template: async (props) => {
            return `<accordion>
            <accordion-group heading="${props.name}">
              This content is straight in the template.
            </accordion-group>
            </accordion>`;
        }
    },
    image: {
        package: {
            execute: 'ng add ngx-bootstrap',
            moduleImports: []
        },
        defaultProperties: { imageSource: 'https://picsum.photos/1024/300', altText: 'Lorem Picsum' },
        template: async (props) => {
            return `<img src="${props.imageSource}" class="img-fluid" alt="${props.altText}">`;
        }
    },
    bsgrid: require('./bootstrap-grid'),
    label: {
        package: {
            execute: 'ng add ngx-bootstrap',
            moduleImports: []
        },
        defaultProperties: { text: 'this is text', bold: false, italic: false, turncate: false, wrap: false, lowercase: false, uppercase: false, align: 'left' },
        template: async (props) => {
            let cls = "";
            if (props.bold === true) {
                cls += 'font-weight-bold ';
            }
            if (props.italic === true) {
                cls += 'font-weight-italic ';
            }

            if (props.turncate === props.wrap === true) {
                cls += 'd-inline-block text-truncate ';
            }
            else if (props.turncate === true) {
                cls += 'd-inline-block text-truncate ';
            }
            else if (props.wrap === false) {
                cls += 'text-nowrap ';
            }

            if (props.lowercase === true) {
                cls += 'text-lowercase ';
            }
            if (props.uppercase === true) {
                cls += 'text-uppercase ';
            }

            cls += `text-${props.align} `;

            return `<span class="${cls}">
                    ${props.text}
                    </span>`;
        }
    }
}

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