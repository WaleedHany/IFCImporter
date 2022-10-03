import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import Model from './Model/Model'
import InitialResources from './Utils/InitialResources.js'
import Debug from './Utils/Debug'
import sources from './sources.js'
import Commands from './Commands/Commands.js'
import { IFCLoader } from "web-ifc-three/IFCLoader"
import PositionVariables from './Model/PositionVariables.js'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';
import Selection from './Utils/Selection.js'
import RayCasting from './Utils/RayCasting.js'


let instance = null

/**
 * Initalize the main programe
 */
export default class Initialization
{
    constructor(_canvas)
    {
        if(instance)
        {
            return instance
        }
        instance = this

        // Global access
        window.init = this

        // Options
        this.canvas = _canvas

        // Debug
        this.debug = new Debug()

        // sizes
        this.sizes = new Sizes()
        this.sizes.on('resize', ()=>
        {
            this.resize()
        })

        // Scene
        this.scene = new THREE.Scene()
        this.resources = new InitialResources(sources)
        
        // Cameras
        this.camera = new Camera(this.sizes, this.scene, this.canvas)  
        this.cameraList = []
        this.cameraList.push(this.camera)
            
        // Renderer
        this.renderer = new Renderer(this.canvas, this.sizes, this.scene, this, this.camera)

        // Time
        this.time = new Time()
        this.time.on('tick', () =>
        {
            this.update()
        })

        // Main view
        this.Model = new Model(this.scene, this.resources, this.debug)

        // Commands
        this.commands = new Commands()

        /**
         * Uploaded models
         */ 
        this.ifcLoader = new IFCLoader()
        this.ifcLoader.ifcManager.setWasmPath("../static/wasm/")
        // Sets up optimized picking
        this.ifcLoader.ifcManager.setupThreeMeshBVH(
            computeBoundsTree,
            disposeBoundsTree,
            acceleratedRaycast);
        this.ifcLoader.ifcManager.applyWebIfcConfig({
            COORDINATE_TO_ORIGIN: false,
            USE_FAST_BOOLS: true
        });

        // Imported models list
        this.importedModels = {models:[], ifcObjects:[]}
        this.SelectedObjects = {selectedObjectsList:[]}

        // Position variables
        this.positionVariables = PositionVariables

        // Element selection
        this.selection = new Selection(this.camera, this.scene, this.renderer, this.importedModels, this.SelectedObjects);
        this.selection.Enable()

        // Raycaster
        this.rayCaster = new RayCasting(this.camera, this.scene, this.renderer, this.importedModels, this.ifcLoader)

        //Creates grids and axes in the scene
        //this.grid = new THREE.GridHelper(50, 30);
        //this.scene.add(this.grid);
        this.axes = new THREE.AxesHelper();
        this.axes.material.depthTest = false;
        this.axes.renderOrder = 1;
        this.scene.add(this.axes);

        this.AllowHide = false
        this.HiddenElements = []

        THREE.Object3D.prototype.rotateAroundWorldAxis = function() {
            // rotate object around axis in world space (the axis passes through point)
            // axis is assumed to be normalized
            // assumes object does not have a rotated parent
            var q = new THREE.Quaternion(); 
            return function rotateAroundWorldAxis( point, axis, angle ) {      
                q.setFromAxisAngle( axis, angle );       
                this.applyQuaternion( q );       
                this.position.sub( point );
                this.position.applyQuaternion( q );
                this.position.add( point );
                return this;
            }
        }();
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update()
    { 
        this.camera.update()
        this.Model.update()
        this.renderer.update()
    }

    unSelect()
    {
        this.selection.UnSelect(this.SelectedObjects)
    }      

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

         // Traverse the whole scene
         this.scene.traverse((child) =>
         {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()
 
                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]
 
                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }

            this.camera.controls.dispose()
            this.renderer.instance.dispose()

            if(this.debug.active)
            {
                this.debug.ui.destroy()
            }  
         })
    }
}