# Layout Section
1. There can be numerous layouts inside a component
2. Each conponent is rendered when associated route is invoked
```json
{
    "type": "row-left",
    "elements": []
}
```
## Properties:
| Name  | Explaination  |
|---|---|
|  type | Type of layout  |
|  [elements](elements.md) | Array of UI-Elements inside this layout they stack horizontally can have total width of 12 |

### type
Enum for different types of containers 
| Name  | Explaination  |
|---|---|
|  row-left | Type of row container which horizontally aligns all contents from left.  |
|  row-right | Type of row container which horizontally aligns all contents to right.  |
|  row-center | Type of row container which horizontally aligns all contents to center.  |
|  row-justify | Type of row container which horizontally aligns all contents to have equal white space between each other.  |
|  row-sides | Type of row container which horizontally aligns all contents to both sides and leaves white space in middle.  |
