import Environment from './Environment.js'
import * as THREE from 'three'

export default class Model 
{
    constructor(scene, resources, debug) 
    {
        THREE.Object3D.DefaultUp.set(0,0,1)
        this.scene = scene
        this.resources = resources
        
        if( this.resources.hasNoSources)
        {
            this.environment = new Environment(this.scene, this.resources, debug)
        }
        
        this.resources.on('ready', () =>
         {
            // Setup
            this.environment = new Environment(this.scene, this.resources, debug)
            
        })
    }
    
    update()
    {   
        // if(this.fox)
        //     this.fox.update()
        
    }
}