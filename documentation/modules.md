# Modules Section
1. There can be numerous modules in an application
2. When a module is created a deafult component is also created for the module route.
3. Module can have subrouting for each component. 
```json
{
    "name": "dashboard",
    "route": "dashboard",
    "components": [],
    "services": [],
    "pipes": [] 
}
```

## Properties:
| Name  | Explaination  |
|---|---|
|  name | Name of the module  |
|  route | url path to load this module on browser, relative without '/' in the starting  |
|  components | Array of components in a module. This can be reffered as to Pages of the application.  |
|  services | Array of services in a module.  |
|  pipes | Array of pipes exposed in a module.  |