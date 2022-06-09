import IFCObject from "../Model/IFCObject.js";
import Command from "./Command.js";

/**
 * Load IFC file.
 * Convert and store IFC.js output geometry to a new three.js geometry.
 * Store IFC data for each object.
 */
export default class CopyElementCommand extends Command
{
    constructor(selectedElementsList, deltaX, deltaY, deltaZ, scene, importedElements) 
    {
        super()
        this.scene = scene
        this.moveInX = parseFloat(deltaX) 
        this.moveInY = parseFloat(deltaY)
        this.moveInZ = parseFloat(deltaZ)
        this.SelectedElements = selectedElementsList
        this.importedElements = importedElements
        this.CopiedElements = []
    }

    execute()
    {
        for(const element of this.SelectedElements)
        {
            if(element.geometry == null) continue
            const elementCopy = new IFCObject()
            elementCopy.replicate(element.modelId, element.expressID, element.geometry, element.materials, element.properties)
            // Adjust position
            elementCopy.mesh.position.x = element.mesh.position.x + this.moveInX
            elementCopy.mesh.position.y = element.mesh.position.y + this.moveInY
            elementCopy.mesh.position.z = element.mesh.position.z + this.moveInZ
            // Adjust rotation
            elementCopy.mesh.rotation.x = element.mesh.rotation.x 
            elementCopy.mesh.rotation.y = element.mesh.rotation.y 
            elementCopy.mesh.rotation.z = element.mesh.rotation.z 
            this.CopiedElements.push(elementCopy)
            this.scene.add(elementCopy.mesh)
            this.importedElements.ifcObjects.push(elementCopy)
        }
        this.SelectedElements = []
    }

    undo()
    {
        this.importedElements.ifcObjects =  this.importedElements.ifcObjects
                                               .filter(ar => !this.CopiedElements.find(rm => (rm.mesh.uuid === ar.mesh.uuid)))
        for(const element of this.CopiedElements)
        {
            this.scene.remove(element.mesh)
            element.reset()      
        }     
    }

    redo()
    {
        for(const element of this.CopiedElements)
        {
            this.scene.add(element.mesh)
            this.importedElements.ifcObjects.push(element)
        }
    }

    remove()
    {
        this.moveInX = null
        this.moveInY = null
        this.moveInZ = null
        for(const element of this.CopiedElements)
        {
            element.dispose(this.importedElements.ifcObjects)      
        }  
        this.CopiedElements = [] 
        this.SelectedElements = []
    }
}