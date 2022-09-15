import * as THREE from 'three'
import Command from "./Command.js"
import TextLabels from '../Utils/TextLabels.js'

let DESCENDER_ADJUST = 1; 
/**
 * Load IFC file.
 * Convert and store IFC.js output geometry to a new three.js geometry.
 * Store IFC data for each object.
 */
export default class PointCoordinatesCommand extends Command
{
    constructor(point, scene) 
    {
        super()
        this.scene = scene
        this.point = point
        this.coordinatesString = 
            `x = ${this.point.x.toFixed(3)}\ny = ${this.point.y.toFixed(3)}\nz = ${this.point.z.toFixed(3)}`
        this.textPosition = point.clone().add(new THREE.Vector3(0, 0, 0.5))
        this.text = TextLabels.makeTextSprite(this.coordinatesString, this.textPosition.x, this.textPosition.y, this.textPosition.z,
                                  { fontsize: 120, fontface: "Georgia", 
                                    //fillColor: { r: 255, g: 255, b: 255, a: 0.2 },
                                    textColor: { r: 117, g: 10, b: 201, a: 1.0 },
                                    vAlign: "center", hAlign: "center" });
        this.text.canNotBeRayCasted = false
        this.text.material.depthTest = false
        this.highLight = TextLabels.createHighLight(this.point) 
        this.highLight.canNotBeRayCasted = false
    }

    execute()
    {
        this.scene.add(this.highLight)
        this.scene.add(this.text)
    }

    undo()
    {
        this.scene.remove(this.highLight)
        this.scene.remove(this.text)
    }

    redo()
    {
        this.scene.add(this.highLight)
        this.scene.add(this.text)
    }

    remove()
    {
        this.Line.geometry.dispose()
        this.text.geometry.dispose()
        this.text.material.dispose()
    }
}