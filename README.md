
# IFC Web Editor

Simple IFC web editor, an experimental prof of concept,
aiming to provide simple editing functionalities using IFC.js library, using THREE.js and IFC.js.
This project is experimental and still in progress, and still open to adding more functionalities


## Features

- Supports undoable/redoable actions
- Allows ediding ifc objects in model as: 
    - Moving 
    - Copying
    - Rotating about Z-axis(through object's centroid)
    - Deleting an object
    - Hide objects and show hidden objects
- Multiple selection by mouse dragging, and by pressing Shift+click  
- Allows adding dimensions interactevly to IFC objects in model
    - Point to point dimensions
    - Edge to point dimensions
    - Edge length dimension
    - Show coordinates of a selected point
- Supports gradient backgrounds
- Allows defining IFC model's reference point position in space, and changing model's position (according to model's reference point) 
## Notes

- For rollback actions:
    - ctrl+Z to undo, ctrl+Shidt+Z to redo
- Navigation controlls:
    - Hold and move mouse wheel for camera rotation
    - Hold and move right mouse for pan transition
- Selection controlls:
    - Drag left mouse for multiple selection, or Shift+click for multiple Selection
    - Esc or double click to unselect
- Select an object and press Delete to delete an element
- Dimensions are considered in meter as it is the custom defined unit of THREE.js


## Demo
- Video demo
https://youtu.be/R6AS0MvQgqg
- Application demo
https://waleedhany.github.io/IFCImporter/src/index.html

