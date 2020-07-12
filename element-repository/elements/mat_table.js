class mat_table {
    constructor() {
        this.package = {
            execute: ['npx ng add @angular/material --interactive=false --theme=custom --gestures=true --animations=true'],
            moduleImports: [{ moduleName: 'MatTableModule', link: '@angular/material/table' }]
        },
            this.defaultProperties = {
                columns: [{
                    header: "ColA"
                },
                {
                    header: "ColB"
                },
                {
                    header: "ColC"
                }]
            };
        this.template = this.template.bind(this);
    }

    async template(props, layoutBuilder) {
        //Need to add following code in TS side which we are not able to do now.
        // displayedColumns: string[] = ['name', 'weight', 'symbol'];
        //   data = [
        //     { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
        //     { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
        //     { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
        //     { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
        //     { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
        //     { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
        //     { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
        //     { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
        //     { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
        //     { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
        //   ];
        return {
            "style": "",
            "html": `<table style="width:100%" mat-table [dataSource]="data">
        <ng-container [matColumnDef]="column" *ngFor="let column of displayedColumns">
          <th mat-header-cell *matHeaderCellDef> {{column}} </th>
          <td mat-cell *matCellDef="let element"> {{element[column]}} </td>
        </ng-container>
      
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>` };
    }
}