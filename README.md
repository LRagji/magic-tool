# magic-tool
A Automation tool for all your enterprise routine task(Current Support only Angular and Bootstrap)

## Tool Json Explained
The following are different sections of tool json
1. Tool json should be named as .magic-tool.json and should be placed in transpiler directory.

### Project Section
1. A default Project will always have a app modules with app component which will load by deafult.
```json
{
    "name": "OFE", // This is the name of the project
    "workspace": "/Users/laukikragji/Documents/Git/Local/magic-tool/workspace", //This is the workspace where the project will be created
    "modules": [] // List of modules that are currently exisiting in the project
}
```

### Modules Section
1. There can be numerous modules in an application
2. When a module is created a deafult component is also created for the module route.
3. Module can have subrouting for each component. 
```json
{
    "name": "dashboard", // Name of the module
    "route": "dashboard",// Route on client browser which this module will load
    "components": [], // Components contained in this module
    "services": [], // Services contained in this module
    "pipes": [] // Pipes contained in this module
}
```

### Component Section
1. There can be numerous components inside a module
2. Each conponent is rendered when associated route is invoked
```json
{
    "name": "detail", // Name of the component
    "route": "detail", //Route of the component on which it will be rendered
    "layout": [] // Layout of the components
}
```