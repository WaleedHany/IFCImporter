import Initialization from "../Application"
import * as THREE from 'three'
import IFCObject from '../Model/IFCObject.js'
import Command from "./Command.js";

export default class LoadIfcCommand extends Command
{
    constructor(urlPath, position) 
    {   
        super()
        this.type = 'LoadIfcFileCommand';
		this.name = 'LoadIfcFile';

        this.init = new Initialization()   
        this.scene = this.init.scene 
        this.ifcLoader = this.init.ifcLoader

        this.initialPosition = position
        this.path = urlPath
        this.model = null   

        this.createdObjects = []
    }

    async execute() 
    { 
        if ( this.path !== null)
        {
            document.body.style.cursor = "wait"
            this.ifcLoader.load(
                this.path,
                (ifcModel) => 
                {
                    this.model = ifcModel
                    // assign model position
                    ifcModel.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z)
                    //this.scene.add(ifcModel)
                    // add to imported models list
                    this.init.importedModels.models.push(this.model)
                    
                    /**
                     * Create new objects from imported ifc model
                     */
                    const expressIds = this.model.geometry.attributes.expressID.array
                    const positions = this.model.geometry.getAttribute('position').array
                    const normals = this.model.geometry.getAttribute('normal').array
                
                    this.materials = this.model.material
                    let prevId = 0
                    let currentId = 0

                    for(let i = 0; i < expressIds.length; i++)
                    {
                        currentId = expressIds[i]    
                        if ((currentId !== prevId && i !== 0) || i == expressIds.length-1)
                        {
                             try
                             {
                                const obj = this.ifcLoader.ifcManager.createSubset({
                                modelID: this.model.modelID,
                                ids: [prevId],
                                scene: this.model,
                                removePrevious: true 
                                })   
                                if(obj.geometry != null)   
                                {
                                    const indeces = obj.geometry.index.array
                                    const subObjects = obj.geometry.groups.filter(x => x.count > 0)
                                    if(subObjects.length > 0)
                                    {         
                                        let materials = []
                                        for(const obj of subObjects)
                                        {
                                            materials.push(this.materials[obj.materialIndex])
                                        }
                                        let object = new IFCObject(
                                            this.model.modelID, prevId, 
                                            positions, normals, indeces, 
                                            subObjects, materials,
                                            this.ifcLoader.ifcManager)
                                        // add to local stored objects for undo operation
                                        this.createdObjects.push(object)
                                        // add to loaded objects list
                                        this.init.importedModels.ifcObjects.push(object)
                                        // add to scene
                                        this.scene.add(object.mesh)
                                    }
                                }
                            }
                            catch(err){
                                console.log(err)
                                continue
                            }       
                        }   
                        else if(currentId != prevId && i == 0)
                        {
                           prevId = expressIds[i]
                        }
                        prevId = currentId
                    }
                    this.ifcLoader.ifcManager.removeSubset(this.model.modelID)

                    // Adjust positions for each imported (created) element
                    for(const object of this.createdObjects)
                    {
                        object.mesh.position.set(this.initialPosition.x + object.position.x ,
                             this.initialPosition.y + object.position.y, this.initialPosition.z + object.position.z)           
                    }
                    // return cursor to default
                    document.body.style.cursor = "default"             
                },
            );
        }     
    }

    undo() 
    {
        // Remove all objects in model 
        this.model.traverse((child) =>
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
        })
        // remove all created ifc objects from storage lists
        this.init.importedModels.ifcObjects =  this.init.importedModels.ifcObjects
                                               .filter(ar => !this.createdObjects.find(rm => (rm.mesh.uuid === ar.mesh.uuid)))
        this.init.SelectedObjects.selectedObjectsList = this.init.SelectedObjects.selectedObjectsList
                                                    .filter(ar => !this.createdObjects.find(rm => (rm.mesh.uuid === ar.mesh.uuid)))
        for(const object of this.createdObjects)
        {
            this.scene.remove(object.mesh)
            object.reset()
        }
        // remove from imported models
        const index = this.init.importedModels.models.indexOf(this.model); 
        this.init.importedModels.models.splice(index, 1);
    }

    redo() 
    {
        // add model to imported models
        this.init.importedModels.models.push(this.model)
        // add objects to scene and objects list
        for (const object of this.createdObjects) 
        {
            object.replicate(object.modelID, object.expressID, object.geometry, object.materials, object.properties)
            object.mesh.position.set(this.initialPosition.x + object.position.x ,
                this.initialPosition.y + object.position.y, this.initialPosition.z + object.position.z) 
            this.scene.add(object.mesh)
            this.init.importedModels.ifcObjects.push(object)
        }  
    }

    remove() 
    {
        for (const object of this.createdObjects) 
        {
            object.dispose(this.init.importedModels.ifcObjects)
        } 
        this.path = null
        this.model = null
    }
}