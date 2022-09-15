import * as THREE from 'three'
import Command from "./Command.js"
import TextLabels from '../Utils/TextLabels.js'

let DESCENDER_ADJUST = 1; 
/**
 * Load IFC file.
 * Convert and store IFC.js output geometry to a new three.js geometry.
 * Store IFC data for each object.
 */
export default class DimentionBetweenLineAndPoint extends Command
{
    constructor(line, point, scene) 
    {
        super()
        this.scene = scene
        this.point = point
        this.line = line
        this.endPoint = this.#GetIntersectionBetweenPointAndLine(line, point)
        this.points = [this.point, this.endPoint]
        this.linematerial = new THREE.LineBasicMaterial( { color: 0xff00ff , depthTest: false} )
        this.subLinematerial = new THREE.LineBasicMaterial( { color: 0x333333 } )
        this.lineGeom = new THREE.BufferGeometry().setFromPoints(this. points )
        this.Line = new THREE.Line( this.lineGeom, this.linematerial )
        this.Line.name = 'TwoPointsDimentionLine'
        this.Line.canNotBeRayCasted = false
        this.distance = this.point.distanceTo(this.endPoint)
        this.distanceString = this.distance.toFixed(3) + " [m]"
        this.textPosition = this.#GetTextPosition(this.point, this.endPoint)
        this.text = TextLabels.makeTextSprite(this.distanceString, this.textPosition.x, this.textPosition.y, this.textPosition.z,
                                  { fontsize: 120, fontface: "Georgia", textColor: { r: 117, g: 10, b: 201, a: 1.0 },
                                   vAlign: "center", hAlign: "center" });
        let nearerPoint = this.line.points[0];
        if(this.line.points[0].distanceTo(this.endPoint) > this.line.points[1].distanceTo(this.endPoint))
        {
            nearerPoint = this.line.points[1]
        }

        this.subLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([nearerPoint, this.endPoint]), 
            this.subLinematerial)
        this.text.material.depthTest = false
        this.text.canNotBeRayCasted = false
    }

    execute()
    {
        this.scene.add(this.Line)
        this.scene.add(this.subLine)
        this.scene.add(this.text)
    }

    undo()
    {
        this.scene.remove(this.Line)
        this.scene.remove(this.subLine)
        this.scene.remove(this.text)
    }

    redo()
    {
        this.execute()
    }

    remove()
    {
        this.Line.geometry.dispose()
        this.subLine.geometry.dispose()
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

    #GetIntersectionBetweenPointAndLine(line, point)
    {
        const vector = point.clone().sub(line.points[0])
        const projection = vector.dot(line.vector)
                          /Math.sqrt((line.vector.x * line.vector.x) + (line.vector.y * line.vector.y) +(line.vector.z * line.vector.z))
        return line.points[0].clone().add(line.vector.clone().normalize().multiplyScalar(projection))
    }
}