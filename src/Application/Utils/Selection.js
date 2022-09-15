import { Raycaster, Vector2, MeshLambertMaterial} from "three";
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox.js';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper.js';

const tempMouse = new Vector2()
const canvas = document.querySelector('canvas.webgl')
let instance = null

export default class Selection
{  
    /**
     * RayCast for object selection, store and change color of selected object
     * @param {Camera} camera  Three.js camera
     * @param {THREE.scene} scene  THREE.js scene
     * @param {Renderer} renderer WebGl renderer
     * @param {List<IFCObject>} importedIfcObjects list of 3D objects
     * @param {List<IFCObject>} selectedObjectsList list to store selected objects
     */
    constructor(camera, scene, renderer, importedIfcObjects, selectedObjectsList)
    {
        if(instance)
        {
            return instance
        }
        instance = this

        this.camera = camera.instance
        this.scene = scene

        this.raycaster = new Raycaster();
        this.raycaster.firstHitOnly = true;
        this.mouse = new Vector2()

        this.HighlightMaterial = new MeshLambertMaterial({
            transparent: true,
            opacity: 0.4,
            color: 0x88bbff,
            depthTest: false
        })

        this.selectMaterial = new MeshLambertMaterial({
            transparent: true,
            opacity: 0.4,
            color: 0xff00ff,
            depthTest: false
         })

        // References to the previous selection
        this.HighlightedObject = {ifcObject:null}
        this.SelectedObjects = selectedObjectsList
        this.importedObjects = importedIfcObjects

        // Box selection
        this.renderer = renderer.instance
        this.selection = new SelectionBox(this.camera, this.scene)
        this.helper = new SelectionHelper(this.selection, this.renderer, 'selectBox')
        this.startFlag = false
        this.worker = new Worker('./Application/Utils/SelectionWorker.js')
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


    Hover(event, material, object)
    {
        this.#UpdateMousePosition(event) 
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Removes previous highlight if any existed    
        if(object.ifcObject !== null)
        {
            // Removes previous highlight
            object.ifcObject.originalColor(this.scene)
            object.ifcObject = null
        }

        // Cast a ray
        let allowedIntersections = this.scene.children.filter(s => !s.isLine && !s.hasOwnProperty('canNotBeRayCasted'))
        const intersection = this.raycaster.intersectObjects(allowedIntersections)[0];
        if(intersection != null && intersection.object.hasOwnProperty('modelObject'))
        {
            //console.log(intersection.point)
            object.ifcObject = intersection.object.modelObject
            // highlight intersected object
            object.ifcObject.highLight(material, this.scene)
        } 
    }


    Select(event, material, add, selectAll)
    {
        this.#UpdateMousePosition(event) 

        // if(this.camera instanceof OrthographicCamera)
        // {
        //     this.raycaster.ray.origin.set(0, 0, 0)
        //     this.camera.localToWorld(this.raycaster.ray.origin)
        //     this.raycaster.setFromCamera(this.mouse, this.camera)
        //     this.raycaster.ray.origin.z is this.camera.far
        // }
        // else
        // {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        //}
        // Cast a ray
        let allowedIntersections = this.scene.children.filter(s => !s.isLine && !s.hasOwnProperty('canNotBeRayCasted'))
        const intersection = this.raycaster.intersectObjects(allowedIntersections, false)[0];

        if(intersection != null && intersection.object.hasOwnProperty('modelObject'))
        {
            // if selection without addind, remove all previous selections
            if(!add)
            {
                // for all selected elements
                for (const obj of this.SelectedObjects.selectedObjectsList)
                {
                    // delete overlay highlight
                    obj.unselect(this.scene)
                } 
                // remove all elements from selected list
                this.SelectedObjects.selectedObjectsList = []
            } 

            let object = intersection.object.modelObject
            if (add && selectAll)
            {
                // find all objects belonging to the same model
                let modelObjects = this.importedObjects.ifcObjects.filter(e => e.modelId == object.modelId)

                // filter only distinct objects (remove duplicates if any)
                const repititions = this.SelectedObjects.selectedObjectsList.filter(e => e.modelId == object.modelId)
                modelObjects = modelObjects.filter((e) => !repititions.includes(e))
                // add to selection
                for(const obj of modelObjects)
                {
                    // highlight intersected object
                    obj.select(material, this.scene)
                    // add to selected objects list
                    this.SelectedObjects.selectedObjectsList.push(obj)
                }
            }
            // if selection is not repeated, proceed
            else if (! this.SelectedObjects.selectedObjectsList.some(e => e.mesh.uuid == intersection.object.uuid))
            {
                // highlight intersected object
                object.select(material, this.scene)
                // add to selected objects list
                this.SelectedObjects.selectedObjectsList.push(object)
            }    
            else if (add) // to unselect already selected element when pressing shift
            {
                const selectedOject = this.SelectedObjects.selectedObjectsList.filter(e => e.mesh.uuid == intersection.object.uuid)[0]
                const index = this.SelectedObjects.selectedObjectsList.indexOf(selectedOject); 
                this.SelectedObjects.selectedObjectsList.splice(index, 1);
                object.unselect(this.scene)
            }   
        }
    }

    /**
     * Unselect a list of selected objects objects
     * @param {List} selectedObjects list of objects (of type ifcObject)
     */
    UnSelect(selectedObjects)
    {
        for(const object of selectedObjects.selectedObjectsList)
        {
            // delete overlay highlight
            object.unselect(this.scene)
        }
        // remove all elements from selected list
        this.SelectedObjects.selectedObjectsList = []
        if(  this.HighlightedObject.ifcObject != null)
        {
            this.HighlightedObject.ifcObject.originalColor(this.scene)
            this.HighlightedObject.ifcObject = null
        }
    }

    #MouseDown(event)
    {
        if (event.button === 0 && event.target == canvas) 
        {
            instance.Select(
                event,
                instance.selectMaterial,
                event.shiftKey? true:false,
                instance.selectAll )
          
            instance.selection.startPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5);
            // start set(( event.clientX / window.innerWidth ) * 2 - 1,  -(event.clientY / window.innerHeight) * 2 + 1)
            // positions push(new Vector2(start.x, start.y))
            instance.startFlag = true
        }
        else
        {
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden")
        }
    }

    #MouseMove(event)
    {
        instance.Hover(
            event,
            instance.HighlightMaterial,
            instance.HighlightedObject)

        if (event.button === 0 && instance.startFlag) 
        {
            if (instance.helper.isDown) {
                instance.selection.endPoint.set(
                    (event.clientX / window.innerWidth) * 2 - 1,
                    -(event.clientY / window.innerHeight) * 2 + 1,
                    0.5);
                    document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "visible")
            }
            else{
                instance.startFlag = false
            }
        }
        else
        {
            instance.startFlag = false
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden")
        }
    }
    
    #MouseUp(event)
    {
        if (event.button === 0 && instance.startFlag) 
        {
            instance.selection.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
                0.5);
            let distance = instance.selection.endPoint.distanceTo(instance.selection.startPoint)
            if(distance > 0.1)
            {
                // get selected elements
                const allSelected = instance.selection.select();
                const selectedElementsList = allSelected.filter(obj => obj.hasOwnProperty('modelObject'));
                // make sure no elements are duplicated in selected elements list
                let selectedElements = [];
                selectedElementsList.forEach((c) => {
                    if (!selectedElements.includes(c.modelObject) && !instance.SelectedObjects.selectedObjectsList.includes(c.modelObject)) {
                        selectedElements.push(c.modelObject)            
                        // highlight intersected object
                        c.modelObject.select(instance.selectMaterial, instance.scene)
                        // add to selected objects list
                        instance.SelectedObjects.selectedObjectsList.push(c.modelObject)
                    }
                });
                // let message   {elements: JSON.parse(JSON.stringify(selectedElements)), 
                //                 selectedMaterial: instance.selectMaterial,
                //                 scene: JSON.parse(JSON.stringify(instance.scene))
                //               }
                // instance worker.postMessage(message)
            }
  
            document.querySelectorAll(".selectBox").forEach(x => x.style.visibility = "hidden")
            // new selection started to false
            instance.startFlag = false;
        }
    }

    #DoubleClickEvent(event)
    {
        if(!event.shiftKey)
        instance.UnSelect (instance.SelectedObjects)
    }

    #AdditionalKeysPressed(event)
    {
        if (event.key == "Escape")
        {
            instance.UnSelect (instance.SelectedObjects)
        }
        if(event.key == 'A')     
        {
            instance.selectAll = true
        }
        else{
            instance.selectAll = false
        }
    }
  
    Enable()
    {
        this.selectAll = false

        canvas.addEventListener('dblclick', this.#DoubleClickEvent)

        document.addEventListener('keydown', this.#AdditionalKeysPressed)

        /**
         * Mouse move, Element selections and Box selection 
         */
        // 1- when mouse down
        canvas.addEventListener('mousedown', this.#MouseDown)

        // 2- when mouse move
        canvas.addEventListener('mousemove', this.#MouseMove)

        // 3- whem mouse up (selection process)
        canvas.addEventListener('mouseup', this.#MouseUp)
    }

    Disable()
    {
        document.removeEventListener('keydown', this.#AdditionalKeysPressed)
        canvas.removeEventListener('dblclick',  this.#DoubleClickEvent)
        canvas.removeEventListener('mousedown', this.#MouseDown)
        canvas.removeEventListener('mousemove', this.#MouseMove)
        canvas.removeEventListener('mouseup', this.#MouseUp)
    }
}
