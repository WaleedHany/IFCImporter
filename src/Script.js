import Initialization from './Application/Application.js'
import LoadIfcCommand from './Application/Commands/LoadIfcCommand.js'
import MoveElementCommand from './Application/Commands/MoveElementsCommand.js'
import CopyElementCommand from './Application/Commands/CopyElementCommand.js'
import DimentionBetweenTwoPoints from './Application/Commands/DimentionBetweenTwoPoints.js'
import DimentionBetweenLineAndPoint from './Application/Commands/DimentionBetweenLineAndPoint.js'
import PointCoordinatesCommand from './Application/Commands/PointCoordinatesCommand.js'
import * as THREE from 'three'
import DeleteCommand from './Application/Commands/DeleteCommand.js'
import RotateElementCommand from './Application/Commands/RotateElementsCommand.js'
import Hide_ShowElementCommand from './Application/Commands/HideElementCommand.js'

/**
 * Program Initialization
 */
const init = new Initialization(document.querySelector('canvas.webgl'))
let dialog = document.getElementById('location-dialog-form')

/**
 * Events
 */
//#region Events

/**
 * Import IFC model
 */ 
const input = document.getElementById("file-input");
input.addEventListener("change", (changed) => 
  {
    const file = changed.target.files[0];
    let ifcURL
    if (file != null)
    {
      ifcURL = URL.createObjectURL(file);
    }
    else{
      return
    }
    let position = new THREE.Vector3(init.positionVariables.positionX, init.positionVariables.positionY, init.positionVariables.positionZ)
    init.commands.executeCommand(new LoadIfcCommand(ifcURL, position))
  },
  false)
  


/**
 * Define model location
 */ 
document.getElementById("model-location").onclick=function(){ModelLocationDialog()};
function ModelLocationDialog() 
{
  document.getElementById('dialog-form-title').innerHTML = "Model LocaTion"
  //document.getElementById('show').onclick = function() {    
  dialog.show()   
  document.getElementById('Ok').onclick = function() 
  {
    init.positionVariables.positionX = parseFloat(document.getElementById('positionX').value)
    init.positionVariables.positionY = parseFloat(document.getElementById('positionY').value)
    init.positionVariables.positionZ = parseFloat(document.getElementById('positionZ').value)
    document.getElementById('positionX').innerHTML = init.positionVariables.positionX
    document.getElementById('positionY').innerHTML = init.positionVariables.positionY
    document.getElementById('positionZ').innerHTML = init.positionVariables.positionZ
    dialog.close();    
  };  
}

/**
 * Move element
 */
document.getElementById("move-button").onclick=function(){MoveElementDialog()};
function MoveElementDialog() 
{  
  if(init.SelectedObjects.selectedObjectsList.length > 0)
  {
    init.selection.Disable()
    init.rayCaster.Enable()
    dialog = document.getElementById('location-dialog-form')
    document.getElementById('dialog-form-title').innerHTML = "Move Element"
    //document.getElementById('show').onclick = function() {    
    dialog.show()   

    document.addEventListener('keydown', stop)

    document.getElementById('Ok').onclick = function() 
    {
      const deltaX = parseFloat(document.getElementById('positionX').value)
      const deltaY = parseFloat(document.getElementById('positionY').value)
      const deltaZ = parseFloat(document.getElementById('positionZ').value)
      init.commands.executeCommand(new MoveElementCommand(init.SelectedObjects.selectedObjectsList, deltaX, deltaY, deltaZ))
      dialog.close() 
      init.rayCaster.Disable()
      init.selection.Enable()
      init.unSelect()
      document.getElementById('positionX').innerHTML = 0
      document.getElementById('positionY').innerHTML = 0
      document.getElementById('positionZ').innerHTML = 0
      init.rayCaster.off('TwoPointsSelected')
      document.removeEventListener('keydown', stop)
    }
    init.rayCaster.on('TwoPointsSelected', ()=>
    {
      let vector = init.rayCaster.pointsList[1].sub(init.rayCaster.pointsList[0])
      init.rayCaster.Disable()
      init.selection.Enable()
      init.commands.executeCommand(new MoveElementCommand(init.SelectedObjects.selectedObjectsList, vector.x, vector.y, vector.z))
      dialog.close()
      init.unSelect()
      init.rayCaster.off('TwoPointsSelected')
      document.removeEventListener('keydown', stop)
    })
  }
}

/**
 * Copy element
 */
document.getElementById("copy-button").onclick=function(){CopyElementDialog()};
function CopyElementDialog() 
{
  if(init.SelectedObjects.selectedObjectsList.length > 0)
  {
    init.selection.Disable()
    init.rayCaster.Enable()
    dialog = document.getElementById('location-dialog-form')
    document.getElementById('dialog-form-title').innerHTML = "Copy Element" 
    dialog.show()   
    document.addEventListener('keydown', stop)

    document.getElementById('Ok').onclick = function()
    {
      const deltaX = parseFloat(document.getElementById('positionX').value)
      const deltaY = parseFloat(document.getElementById('positionY').value)
      const deltaZ = parseFloat(document.getElementById('positionZ').value)
      init.commands.executeCommand(new CopyElementCommand(init.SelectedObjects.selectedObjectsList, 
                                                          deltaX, deltaY, deltaZ, init.scene, init.importedModels))
      init.unSelect()
      dialog.close() 
      document.getElementById('positionX').innerHTML = 0
      document.getElementById('positionY').innerHTML = 0
      document.getElementById('positionZ').innerHTML = 0
      init.rayCaster.off('TwoPointsSelected')
      document.removeEventListener('keydown', stop)
      init.rayCaster.Disable()
      init.selection.Enable()
    }

    init.rayCaster.on('TwoPointsSelected', ()=>
    {
      let vector = init.rayCaster.pointsList[1].sub(init.rayCaster.pointsList[0])
      init.rayCaster.Disable()
      init.selection.Enable()
      init.commands.executeCommand(new CopyElementCommand(init.SelectedObjects.selectedObjectsList, 
                                                          vector.x, vector.y, vector.z, init.scene, init.importedModels))
      dialog.close()
      init.unSelect()
      init.rayCaster.off('TwoPointsSelected')
      document.removeEventListener('keydown', stop)
    })
  }
}

/**
 * Rotate element
 */
document.getElementById("rotate-button").onclick=function(){RotateElementDialog()};
function RotateElementDialog() 
{
  dialog = document.getElementById('rotation-dialog-form')
  document.getElementById('rotation-dialog-form-title').innerHTML = "Rotate Element"  
  dialog.show()   
  document.getElementById('Ok-rotation').onclick = function() 
  {
    const deltaZ = parseFloat(document.getElementById('rotationZ').value) * (Math.PI / 180)
    init.commands.executeCommand(new RotateElementCommand(init.SelectedObjects.selectedObjectsList,0, 0, deltaZ))
    init.rayCaster.Disable()
    init.selection.Enable()
    init.unSelect()
    dialog.close() 
    document.getElementById('rotationZ').innerHTML = "0"
  }; 
}


/**
 * Key board shortcuts
 */
document.addEventListener('keydown', function(event)
{	  
  if(event.key === "Delete") {  Delete(); }
  if(event.key === "z" && event.ctrlKey){		Undo();	}
  if(event.key === "y" && event.ctrlKey){		Redo();	}
  if( event.key === "Z" && event.shiftKey && event.ctrlKey){	Redo();	}
});

//#endregion



/**
 * Methods
 */
//#region Methods

/**
 * Undo
 */
 document.getElementById("Undo").onclick=function(){Undo()};
function Undo()
{
   // unselect all selected elements
   init.unSelect()
   // undo last command
   init.commands.undoCommand();
}


/**
 * Redo
 */
 document.getElementById("Redo").onclick=function(){Redo()};
function Redo()
{
   // unselect all selected elements
   init.unSelect()
   // redo last undo
   init.commands.redoCommand();
}


 /**
  * Delete
  */
  document.getElementById("delete-button").onclick=function(){Delete()};
function Delete()
{
  let selectedElements = [...init.SelectedObjects.selectedObjectsList]
  // unselect all selected elements
  init.unSelect()
  // Delete element, call delete command
  init.commands.executeCommand(new DeleteCommand(selectedElements, init.scene, init.importedModels))
}

/**
  * Hide/Show
  */
 document.getElementById("hide-button").onclick=function(){Hide()};
 function Hide()
 {
   let selectedElements = [...init.SelectedObjects.selectedObjectsList]
   if (!init.AllowHide || selectedElements.length > 0)
   {
     init.AllowHide = true
   }  
   else init.AllowHide = false
   // unselect all selected elements
   init.unSelect()
   // Delete element, call delete command
   Hide_ShowElementCommand.Apply(selectedElements, init.scene, init, init.AllowHide)
 }

//#endregion

//#region Helper Methods
/**
 * Helper Methods
 */
function stop(event)
{
  if(event.key === "Escape") 
  {
    init.rayCaster.Disable()
    init.selection.Enable()
    init.rayCaster.pointsList = []
    dialog.close() 
  }
}

//#endregion // Helper Methods