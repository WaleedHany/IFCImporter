import * as THREE from 'three'

let mouse = new THREE.Vector2()

export default class Renderer
{
    constructor(canvas, sizes, scene, application, camera)
    {
        this.canvas = canvas
        this.sizes = sizes
        this.scene = scene
        this.application = application
        this.camera = camera
        this.application.cameraList.forEach(c => { c.controls.enabled = false })
        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        
        this.instance.physicallyCorrectLights = true
        this.instance.outputEncoding = THREE.sRGBEncoding
        this.instance.toneMapping = THREE.CineonToneMapping
        this.instance.toneMappingExposure = 1
        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        //this instance setColor( 0x0000f0, 0xffffff);
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
        this.application.cameraList.forEach(c => c.instance.updateProjectionMatrix())
    }

    update()
    {
        if (this.application.cameraList.count == 1)
        {
            this.instance.render(this.scene, this.camera.instance)
        }
        else {
            for (const camera of this.application.cameraList)
            {
                let left = 2 + (camera.x * this.sizes.width)
                let bottom = 2 + this.sizes.height - ((camera.heightRatio * this.sizes.height) + (camera.y * this.sizes.height));
                let width = camera.widthRatio * this.sizes.width - 2;
                let height = camera.heightRatio * this.sizes.height - 2;
                this.instance.setViewport (left,bottom,width,height);
                this.instance.setScissor(left,bottom,width,height);
                this.instance.setScissorTest (true);
               // camera.instance.aspect = width / height;
                camera.instance.updateProjectionMatrix();
                this.instance.render (this.scene, camera.instance);
            }
        } 
    }
}