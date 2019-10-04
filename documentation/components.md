## Component Section
1. There can be numerous components inside a module
2. Each conponent is rendered when associated route is invoked
```json
{
    "name": "detail", // Name of the component
    "route": "detail", //Route of the component on which it will be rendered
    "layout": [] // Layout of the components
}
```
Properties:
| Name  | Explaination  |
|---|---|
|  name | Name of the component  |
|  route | url path to load this component on browser, relative without '/' in the starting  |
|  [layouts](layouts.md) | Array of layout in this component.  |
|  container | Enum value which specifies what type of container to have this layout in. (normal|strech) |

### container:
This is type of ui container which holds the layout

Possible values:
1. normal: container will have gutter on left and right side.
2. strech: container will be streched for entire page width.