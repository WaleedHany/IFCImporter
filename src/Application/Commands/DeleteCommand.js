import Command from "./Command.js";

export default class DeleteCommand extends Command
{
    constructor(selectedElementsList, scene, importedModels) 
    {
        super()
        this.scene = scene
        this.selectedElements = selectedElementsList
        this.importedModels = importedModels
        this.deletedElements = []

    }

    execute()
    {
        for(const element of this.selectedElements)
        {
            element.reset()
            this.scene.remove(element.mesh)
        }
        this.importedModels.ifcObjects =  this.importedModels.ifcObjects
                                            .filter(ar => !this.selectedElements
                                            .find(rm => (rm.mesh.uuid === ar.mesh.uuid)))
    }

    undo()
    {
        for (const object of this.selectedElements) 
        {
            // object.replicate(object.modelID, object.expressID, object.geometry, object.materials, object.properties)
            // object.mesh.position.set(object.position.x, object.position.y, object.position.z)
            this.scene.add(object.mesh)
            this.importedModels.ifcObjects.push(object)
        }  
    }

    redo()
    {
        this.execute()
    }

    remove()
    {
        this.SelectedElements = []
    }

    dispose()
    {
        for (const element of this.selectedElements) 
        {
            element.dispose()
        }  
    }
}