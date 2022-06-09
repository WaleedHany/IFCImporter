import Command from "./Command.js";
import { Vector3, Object3D, Quaternion} from "three";

export default class RotateElementCommand extends Command
{
    
    
    constructor(selectedElementsList, rX, rY, rZ) 
    {
        super()
        this.rotationInX = parseFloat(rX) 
        this.rotationInY = parseFloat(rY)
        this.rotationInZ = parseFloat(rZ)
        this.SelectedElements = selectedElementsList
    }

    execute()
    {
        for(const element of this.SelectedElements)
        {
            //this.centerPoint = this.#getCenterPoint(element.mesh)
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(1, 0, 0), this.rotationInX)
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(0, 1, 0), this.rotationInY)
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(0, 0, 1), this.rotationInZ)
            element.mesh.rotation.x += this.rotationInX
            element.mesh.rotation.y += this.rotationInY
            element.mesh.rotation.z += this.rotationInZ
        }
    }

    undo()
    {
        for(const element of this.SelectedElements)
        {
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(1, 0, 0), -this.rotationInX)
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(0, 1, 0), -this.rotationInY)
            // element.mesh.rotateAroundWorldAxis(this.centerPoint, new Vector3(0, 0, 1), -this.rotationInZ)
            element.mesh.rotation.x -= this.rotationInX
            element.mesh.rotation.y -= this.rotationInY
            element.mesh.rotation.z -= this.rotationInZ
        }
    }

    redo()
    {
        this.execute()
    }

    remove()
    {
        this.rotationInX = null
        this.rotationInY = null
        this.rotationInZ = null
        this.SelectedElements = null
    }

    #getCenterPoint(mesh) {
        var middle = new Vector3();
        var geometry = mesh.geometry;
    
        geometry.computeBoundingBox();
    
        middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
        middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
        middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
    
        mesh.localToWorld( middle );
        return middle;
    }
}