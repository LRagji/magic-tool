import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addRouteDeclarationToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function addRoutingEntry(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const routeLiteral = `{ path: '${_options.route}',component:${_options.componentName} }`;
    const routerPath = _options.routerPath;
    let routingSource = getSourceFile(tree, routerPath);
    const routerRecorder = tree.beginUpdate(routerPath);
    const routerChange = addRouteDeclarationToModule(routingSource, routerPath, routeLiteral);
    if (routerChange instanceof InsertChange) {
      routerRecorder.insertLeft(routerChange.pos, routerChange.toAdd);
    }
    tree.commitUpdate(routerRecorder);
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
