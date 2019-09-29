// import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { Change, InsertChange } from '@schematics/angular/utility/change';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addImports(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addModuleImportToModule(tree,_options.modulePath,_options.componentName,_options.componentPath)
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

function addModuleImportToModule(host: Tree, modulePath: string, moduleName: string, src: string) {

  const moduleSource = getSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new SchematicsException(`Module not found: ${modulePath}`);
  }

  const changes: Change[] = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach((change: Change) => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}