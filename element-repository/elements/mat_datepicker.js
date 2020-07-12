class mat_datepicker {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [
                { moduleName: 'MatInputModule', link: '@angular/material' },
                { moduleName: 'MatNativeDateModule', link: '@angular/material/core' },
                { moduleName: 'MatFormFieldModule', link: '@angular/material/form-field' },
                { moduleName: 'MatDatepickerModule', link: '@angular/material/datepicker' }]
        },
            this.defaultProperties = { id: 'dp1', label: "Start Date" };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        return {
            "style": "", "html": `<mat-form-field appearance="fill">
          <mat-label>${props.label}</mat-label>
          <input matInput [matDatepicker]="${props.id}" >
          <mat-datepicker-toggle matSuffix [for]="${props.id}"></mat-datepicker-toggle>
          <mat-datepicker #${props.id} disabled="false"></mat-datepicker>
        </mat-form-field>` };
    }
}