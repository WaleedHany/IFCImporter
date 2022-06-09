import { Raycaster, Vector2, Vector3, Mesh, MeshBasicMaterial, Triangle, PerspectiveCamera, RingGeometry, BufferGeometry, Line, LineBasicMaterial} from "three";
import EventEmitter from "./EventEmitter";

const tempMouse = new Vector2()
const canvas = document.querySelector('canvas.webgl')
let instance = null

export default class RayCasting extends EventEmitter
{  
    constructor(camera, scene, renderer, importedIfcObjects)
    {
        // instansiate base class
        super()
        if(instance)
        {
            return instance
        }
        instance = this

        this.camera = camera.instance
        this.scene = scene
        
        this.importedObjects = importedIfcObjects
        this.renderer = renderer.instance
        this.raycaster = new Raycaster()
        this.raycaster.firstHitOnly = true
        this.mouse = new Vector2()
        this.HighlightedPoint =  { a:new Vector3(), b:new Vector3(), c:new Vector3() }

        this.marker = new Mesh(new RingGeometry(0.1, 0.13, 20), new MeshBasicMaterial({
            color: 0xae0000,
            transparent:true,
            depthTest:false
          }));  
        this.marker.name = 'VertexSnippingMarker'
        this.triangle = new Triangle()
        this.pointsList = []

        this.selectLine = false;
        this.LineMaterial = new LineBasicMaterial( { color: 0xff0000 } )
        const points = [];
        points.push( new Vector3( - 10, 0, 0 ) );
        points.push( new Vector3( 0, 10, 0 ) );
        const lineGeom = new BufferGeometry().setFromPoints( points )
        this.Line = new Line( lineGeom, this.LineMaterial )
        this.Line.name = 'EdgeLineHighlight'
        this.LinePoints = []
    }

    /**
     * Computes the position of the mouse on the screen
     * calculate mouse position in normalized device coordinates
     * (-1 to +1) for both components
     */
    #UpdateMousePosition(event) 
    {
        // Computes the position of the mouse on the screen
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        tempMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
        tempMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
        this.mouse = tempMouse
    }

    Hover(event)
    {
        this.#UpdateMousePosition(event) 
        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Cast a ray
        let allowedIntersections = this.scene.children.filter(s => !s.isLine && !s.hasOwnProperty('canBeRayCasted'))
        const intersection = this.raycaster.intersectObjects(allowedIntersections)[0];
        if(intersection != null && intersection.object.hasOwnProperty('modelObject'))
        {
            intersection.object.worldToLocal(intersection.point);
            let point = this.#setPos(intersection, intersection.point);
            intersection.object.localToWorld(point);
            intersection.object.localToWorld(intersection.point);
            if(point != null && intersection.point.distanceTo(point) < 0.3 && !this.selectLine)
            {
               this.marker.position.set(point.x, point.y, point.z)
               this.marker.lookAt(this.camera.position)
               let Scale = 1
               if(this.camera instanceof PerspectiveCamera)
               {
                   Scale = intersection.distance / 18
               }
               else
               {
                   const scaleFactor = 3
                   Scale = scaleFactor/this.camera.zoom
               }
               this.marker.scale.set(Scale, Scale, 1)
               this.scene.add(this.marker)
            }
            else
            {
               this.scene.remove(this.marker)
            }
            intersection.object.worldToLocal(intersection.point);
            let edge = this.#setEdge(intersection, point) 
            if ( edge != null && edge.length == 3 && this.selectLine)
            {
                intersection.object.localToWorld(edge[0])
                intersection.object.localToWorld(edge[1])
                intersection.object.localToWorld(edge[2])
                intersection.object.localToWorld(intersection.point)
                this.#HighLightEdges(intersection, edge)
            }
            else
            {
               // this.#RemoveLineFromScene()
            }
        } 
        else
        {
            this.scene.remove(this.marker)
            this.#RemoveLineFromScene()
        }
    }

    #setPos(intersection, point) 
    {
        this.HighlightedPoint.a.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 0);
        this.HighlightedPoint.b.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 1);
        this.HighlightedPoint.c.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 2);
        let bc = new Vector3();
        this.triangle.set(this.HighlightedPoint.a, this.HighlightedPoint.b, this.HighlightedPoint.c);
        this.triangle.getBarycoord(point, bc);
        if (bc.x > bc.y && bc.x > bc.z) 
        {
          return this.HighlightedPoint.a
        } 
        else if (bc.y > bc.x && bc.y > bc.z) 
        {
            return this.HighlightedPoint.b
        } 
        else if (bc.z > bc.x && bc.z > bc.y) 
        {
            return this.HighlightedPoint.c
        }
        else
        {
            return null
        }
    }

    #HighLightEdges(intersection, edge)
    {
        let distance1 = this.#calculateDistanceBetweenLineAndPoint(intersection.point,edge[0], edge[1])
        let distance2 = this.#calculateDistanceBetweenLineAndPoint(intersection.point, edge[1], edge[2])
        let distance3 = this.#calculateDistanceBetweenLineAndPoint(intersection.point, edge[0], edge[2])
        const distance = Math.min(...[distance1, distance2, distance3])
        let obj = {}
        if(distance == distance1)
        {
            obj= {points:[edge[0], edge[1]], distance: distance}
        }
        else if (distance == distance2)
        {
            obj= {points:[edge[1], edge[2]], distance: distance}
        }
        else if (distance == distance3)
        {
            obj= {points:[edge[0], edge[2]], distance: distance}
        }
        
        if(obj.distance < 0.8)
        {
            this.#RemoveLineFromScene()
            const geometry = new BufferGeometry().setFromPoints( obj.points )
            this.Line = new Line( geometry, this.LineMaterial )
            this.Line.depthTest = false
            this.scene.add(this.Line)
        }   
        else
        {
            this.#RemoveLineFromScene()
        }        
    }

    #setEdge(intersection, point) 
    {
        this.HighlightedPoint.a.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 0);
        this.HighlightedPoint.b.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 1);
        this.HighlightedPoint.c.fromBufferAttribute(intersection.object.geometry.attributes.position, intersection.faceIndex * 3 + 2);
        let bc = new Vector3();
        this.triangle.set(this.HighlightedPoint.a, this.HighlightedPoint.b, this.HighlightedPoint.c);
        this.triangle.getBarycoord(point, bc);
        //let points = this.#GetEdgePoints(bc)
        return [this.HighlightedPoint.a, this.HighlightedPoint.b, this.HighlightedPoint.c]
        // else
        // {
        //     return null
        // }     
    }

    #GetEdgePoints(bc)
    {
        if (bc.x > bc.y && bc.x > bc.z)
        {
            console.log('a')
          if ( bc.y > bc.z) return [this.HighlightedPoint.a, this.HighlightedPoint.b]
          else return [this.HighlightedPoint.a, this.HighlightedPoint.c]
        } 
        else if (bc.y > bc.x && bc.y > bc.z) 
        {
            console.log('b')
          if ( bc.x > bc.z) return [this.HighlightedPoint.a, this.HighlightedPoint.b]
          else return[this.HighlightedPoint.b, this.HighlightedPoint.c]
        } 
        else if (bc.z > bc.x && bc.z > bc.y) 
        {
            console.log('c')
          if ( bc.x > bc.y) return [this.HighlightedPoint.a, this.HighlightedPoint.c]
          else return [this.HighlightedPoint.b, this.HighlightedPoint.c]
        }
        return null
    }

    #calculateDistanceBetweenLineAndPoint(point, linePoint1, linePoint2) {
        // http://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
        //              |(x0-x1)x(x0-x2)|
        //  distance =  -----------------    
        //                  |x2-x1|
        //
        var diff1 = new Vector3(0,0,0).subVectors(point, linePoint1)
        var diff2 = new Vector3(0,0,0).subVectors(point, linePoint2)
        var cross = new Vector3(0,0,0).crossVectors(diff1, diff2)
        var diff3 = new Vector3(0,0,0).subVectors(linePoint2, linePoint1)
        return cross.length() / diff3.length()
    }

    #RemoveLineFromScene(remove = false)
    {
        if (this.selectLine || remove)
        {
            this.scene.remove(this.Line)
            if(this.Line.geometry != null)this.Line.geometry.dispose()   
        }
    }

    #MouseMove(event)
    {
        instance.Hover(event)
        document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden");
    }

    #MouseDown(event)
    {
        console.log(instance.scene.children)
        if(event.button === 0)
        {
            if (instance.pointsList.length >= 2)
            {
                instance.pointsList = []
            }
            let object = instance.scene.getObjectByName('VertexSnippingMarker')
            if (object != null)
            {
                instance.pointsList.push(object.position.clone())
            }
            let line = instance.scene.getObjectByName(instance.Line.name)
            if (line != null)
            {
                instance.selectLine = false
                instance.trigger('LineSelected')
            }
            if (line != null &&  instance.pointsList.length == 1)
            {
                instance.scene.remove(instance.marker)
                instance.#RemoveLineFromScene(true)
                instance.trigger('LineAndPointSelected')
            }
            else if (instance.pointsList.length == 2)
            {
                instance.scene.remove(instance.marker)
                instance.trigger('TwoPointsSelected')
            }
            else if (instance.pointsList.length == 1)
            {
                instance.scene.remove(instance.marker)
                instance.trigger('OnePointSelected')
            }
        }
        document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden")
    }

    #MouseWheel()
    {
        let object = instance.scene.getObjectByName('VertexSnippingMarker')
        if (object != null)
        {
            instance.scene.remove(object)
        }
    }

    Enable(selectLine = false)
    {
        
        // 1- when mouse down
        canvas.addEventListener('mousedown', this.#MouseDown)
        // 2- when mouse move
        canvas.addEventListener('mousemove', this.#MouseMove)  
        // 3- Mouse scrolled   
        canvas.addEventListener("wheel", this.#MouseWheel) 
        this.selectLine =  selectLine
    }

    Disable()
    {
        canvas.removeEventListener('mousedown', this.#MouseDown)
        canvas.removeEventListener('mousemove', this.#MouseMove)
        canvas.removeEventListener('wheel', this.#MouseWheel)
        this.scene.remove(this.marker)
        this.#RemoveLineFromScene(true)
        this.pointsList = []
    }
}






//#region Depricated

// /const snappingElement = document.querySelector(".hoverHighlight")
// /canvas.appendChild(snappingElement)

//        / const circle = new Shape()

//     /const x = 0;
//     /const y = 0;
//     /const radius = 0.1;
//     /circle.absarc(x, y, radius);

//     /const segments = 100;
//     /const geometry = new ShapeGeometry(circle, segments / 2);

//     /const material = new MeshBasicMaterial({
//     /  color: 0xae0000,
//     /  wireframe:true
//     /});

//     /this.marker = new Mesh(geometry, material);


//                    // Using an HTML element for hover highlight////
//     /let positionOnScreen = point.clone()
//     /positionOnScreen.project(this.camera)            
//     /snappingElement.style.visibility = 'visible'
//     /let positionX = (positionOnScreen.x * window.innerWidth/ 2) + (window.innerWidth/ 2) - 7.5
//     /let positionY = -(positionOnScreen.y * window.innerHeight / 2) + (window.innerHeight / 2)- 7.5
//     /snappingElement.style.left= `${positionX}px`
//     /snappingElement.style.top=`${positionY}px`
//     /snappingElement.style.transform = `translateX(${positionX}px) translateY(${positionY}px)`

//#endregion