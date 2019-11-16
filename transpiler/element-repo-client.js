const requireFromString = require('require-from-string');
const rp = require('request-promise-native');

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
            //TODO: This is the baddest thing done, the correct version of the same will include be to move to dynamic imports of es6
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