module.exports = {
    button: {
        installName: "buttons",
        dependencies: [{ moduleName: 'ButtonsModule', link: `ngx-bootstrap/buttons` }],
        defaultProperties: { text: 'No Name' },
        template: (props) => {
            return `<button type="button" class="btn btn-primary">${props.text}</button>`;
        }
    },
    accordion: {
        installName: "accordion",
        dependencies: [{ moduleName: 'AccordionModule', link: `ngx-bootstrap/accordion` }, { moduleName: 'CommonModule', link: '@angular/common' }],
        defaultProperties: { name: 'No Name' },
        template: (props) => {
            return `<accordion>
            <accordion-group heading="${props.name}">
              This content is straight in the template.
            </accordion-group>
            </accordion>`;
        }
    },
    image: {
        installName: "",
        dependencies: [],
        defaultProperties: { imageSource: 'https://picsum.photos/1024/300', altText: 'Lorem Picsum' },
        template: (props) => {
            return `<img src="${props.imageSource}" class="img-fluid" alt="${props.altText}">`;
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