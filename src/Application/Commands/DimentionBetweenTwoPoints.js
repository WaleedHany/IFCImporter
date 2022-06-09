import * as THREE from 'three'
import Command from "./Command.js"
import TextLabels from '../Utils/TextLabels.js'

let DESCENDER_ADJUST = 1; 
/**
 * Load IFC file.
 * Convert and store IFC.js output geometry to a new three.js geometry.
 * Store IFC data for each object.
 */
export default class DimentionBetweenTwoPoints extends Command
{
    constructor(startPoint, endPoint, scene) 
    {
        super()
        this.scene = scene
        this.startPoint = startPoint
        this.endPoint = endPoint
        this.points = [this.startPoint, this.endPoint]
        this.linematerial = new THREE.LineBasicMaterial( { color: 0xff00ff } )
        this.lineGeom = new THREE.BufferGeometry().setFromPoints(this. points )
        this.Line = new THREE.Line( this.lineGeom, this.linematerial )
        this.Line.material.depthTest = false
        this.Line.name = 'TwoPointsDimentionLine'
        this.distance = this.startPoint.distanceTo(this.endPoint)
        this.distanceString = this.distance.toFixed(3) + " [m]"
        this.textPosition = this.#GetTextPosition(this.startPoint, this.endPoint)
        this.text = TextLabels.makeTextSprite(this.distanceString, this.textPosition.x, this.textPosition.y, this.textPosition.z,
                                  { fontsize: 120, fontface: "Georgia", textColor: { r: 117, g: 10, b: 201, a: 1.0 },
                                   vAlign: "center", hAlign: "center" });
        this.text.material.depthTest = false
    }

    execute()
    {
        this.scene.add(this.Line)
        this.scene.add(this.text)
    }

    undo()
    {
        this.scene.remove(this.Line)
        this.scene.remove(this.text)
    }

    redo()
    {
        this.scene.add(this.Line)
        this.scene.add(this.text)
    }

    remove()
    {
        this.Line.geometry.dispose()
        this.text.geometry.dispose()
        this.text.material.dispose()
    }

    #GetTextPosition(startPoint, endPoint)
    {
        const zDirection = new THREE.Vector3(0, 0, -1)
        const lineVector = endPoint.clone().sub(startPoint).normalize()
        let perpendicularVector
        if(lineVector.equals(zDirection) || lineVector.equals(zDirection.negate()))
        {
            perpendicularVector = lineVector.clone().cross(new THREE.Vector3(1, 0, 0)).normalize().cross(lineVector).normalize()
        }
        else
        {
            perpendicularVector = lineVector.clone().cross(zDirection).normalize().cross(lineVector).normalize()
        }
        const initialPosition = startPoint.clone().add(endPoint.clone().sub(startPoint).normalize().multiplyScalar(0.5*(startPoint.distanceTo(endPoint))))
        return initialPosition.add(perpendicularVector.multiplyScalar(0.5))
    }
}