// import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addDecalreImports(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    //addModuleImportToModule(tree,_options.modulePath,_options.componentName,_options.componentPath)
    const routerPath = _options.modulePath;
    let routingSource = getSourceFile(tree, routerPath);
    const moduleImportRecorder = tree.beginUpdate(routerPath);
    const componentRelativePath = _options.componentPath;
    const compName = _options.componentName;
    const moduleImportChange = insertImport(routingSource, routerPath, compName, componentRelativePath);
    if (moduleImportChange instanceof InsertChange)
      moduleImportRecorder.insertLeft(moduleImportChange.pos, moduleImportChange.toAdd);
    tree.commitUpdate(moduleImportRecorder);
    return tree;
  };
}

function getSourceFile(host: Tree, path: string) {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  const content = buffer.toString();

  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}