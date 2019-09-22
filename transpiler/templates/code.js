module.exports = {
    routeUpdaterSchematic: `        if (true) {
        //Adds import statement to routing module.
        const routerPath = modulePath.replace('.module.ts', '-routing.module.ts');
        let routingSource = readIntoSourceFile(host, routerPath);
        const moduleImportRecorder = host.beginUpdate(routerPath);
        const componentRelativePath = find_module_1.buildRelativePath(routerPath, componentPath);
        const compName = classifiedName.replace(/\\..*$/, '');
        const moduleImportChange = ast_utils_1.insertImport(routingSource, routerPath, compName, componentRelativePath);
        if (moduleImportChange instanceof change_1.InsertChange)
            moduleImportRecorder.insertLeft(moduleImportChange.pos, moduleImportChange.toAdd);
        host.commitUpdate(moduleImportRecorder);

        // Adds route path
        routingSource = readIntoSourceFile(host, routerPath);
        const routerRecorder = host.beginUpdate(routerPath);
        const routeLiteral = \`{ path: '\${options.name}',component:\${classifiedName} }\`;
        const routerChange = ast_utils_1.addRouteDeclarationToModule(routingSource, routerPath, routeLiteral);
        if (routerChange instanceof change_1.InsertChange)
            routerRecorder.insertLeft(routerChange.pos, routerChange.toAdd);
        host.commitUpdate(routerRecorder);
    }`
}