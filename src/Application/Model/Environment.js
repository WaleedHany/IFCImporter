import * as THREE from 'three'

export default class Environment
{
    constructor(scene, resources, debug)
    {
        this.scene = scene
        this.resources = resources
        this.debug = debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }

        // Setup
        this.setSunLight()
        //this.setEnvironmentMap() // Commented since no environment map used yet
    }

    setSunLight()
    {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 2)
        // this.sunLight.castShadow = true
        // this.sunLight.shadow.camera.far = 35
        // this.sunLight.shadow.mapSize.set(1024, 1024)
        // this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(3, -3, 3)
        this.scene.add(this.sunLight)
        this.scene.add(new THREE.AmbientLight('#ffffff',1))

        // Debug
        if(this.debug.active)
        {
            this.debugFolder
            .add(this.sunLight, 'intensity')
            .name('lightIntensity').min(0).max(15)
            .step(0.01)

            this.debugFolder
            .add(this.sunLight.position, 'x')
            .name('lightPositionX').min(-10).max(10)
            .step(0.01)

            this.debugFolder
            .add(this.sunLight.position, 'y')
            .name('lightPositionY').min(-10).max(10)
            .step(0.01)

            this.debugFolder
            .add(this.sunLight.position, 'z')
            .name('lightPositionZ').min(-10).max(10)
            .step(0.01)
        }
    }

    // setEnvironmentMap()
    // {
    //     this.environmentMap = {}
    //     this.environmentMap.intensity = 0.4
    //     this.environmentMap.texture = this.resources.items.environmentMapTexture
    //     this.environmentMap.texture.encoding = THREE.sRGBEncoding

    //     this.scene.environment = this.environmentMap.texture

    //     this.environmentMap.updateMaterials = () =>
    //     {
    //         this.scene.traverse((child) =>
    //         {
    //             if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
    //             {
    //                 child.material.envMap = this.environmentMap.texture
    //                 child.material.envMapIntensity = this.environmentMap.intensity
    //                 child.material.needsUpdate = true
    //             }
    //         })
    //     }
    //     this.environmentMap.updateMaterials()

    //     // Debug
    //     if(this.debug.active)
    //     {
    //         this.debugFolder
    //         .add(this.environmentMap, 'intensity')
    //         .name('envMapIntensity').min(0).max(5)
    //         .step(0.01).onChange(this.environmentMap.updateMaterials)
    //     }
    // }
}