import Command from "./Command.js";

export default class MoveElementCommand extends Command
{
    constructor(selectedElementsList, deltaX, deltaY, deltaZ) 
    {
        super()
        this.moveInX = parseFloat(deltaX) 
        this.moveInY = parseFloat(deltaY)
        this.moveInZ = parseFloat(deltaZ)
        this.SelectedElements = selectedElementsList
    }

    execute()
    {
        for(const element of this.SelectedElements)
        {
            element.mesh.position.x += this.moveInX
            element.mesh.position.y += this.moveInY
            element.mesh.position.z += this.moveInZ
        }
    }

    undo()
    {
        for(const element of this.SelectedElements)
        {
            element.mesh.position.x -= this.moveInX
            element.mesh.position.y -= this.moveInY
            element.mesh.position.z -= this.moveInZ
        }
    }

    redo()
    {
        this.execute()
    }

    remove()
    {
        this.moveInX = null
        this.moveInY = null
        this.moveInZ = null
        this.SelectedElements = null
    }
}