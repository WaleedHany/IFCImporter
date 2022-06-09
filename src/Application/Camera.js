import * as THREE from 'three'
import { MapControls, OrbitControls } from './Controls/OrbitControls.js'
import CameraControls from 'camera-controls';

const clock = new THREE.Clock();

export default class Camera
{
    constructor(sizes, scene, canvas)
    {
        this.sizes  = sizes
        this.scene  = scene
        this.canvas = canvas

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        // aspect this.sizes.width / this.sizes.height
        //this.instance = new THREE.OrthographicCamera( -50 , 50 , 50/aspect, -50/aspect, -1000,2000 )
        this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 4000)
        this.instance.position.set(40, 40, 40)
        this.instance.up.set(0,0,1)
        // this.instance.lookAt(1,1,1)
        // const aspect this.sizes.width / this.sizes.height
        // this.instance.position.set(0, 1, 0)
        this.scene.add(this.instance)
    }

    setControls()
    {
        CameraControls.install({THREE: THREE})
        //this.controls  new OrbitControls(this.instance, this.canvas)
        this.controls = new CameraControls(this.instance, this.canvas)
        this.controls.dampingFactor = 0.1
        this.controls.dollyToCursor = true
        this.controls.infinityDolly = true
        this.controls.mouseButtons.left = CameraControls.ACTION.NONE
        this.controls.mouseButtons.middle = CameraControls.ACTION.ROTATE
        this.controls.mouseButtons.right = CameraControls.ACTION.TRUCK
        // this.controls.zoomToCursor  true
        // this.controls.enableDamping  true
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        const delta = clock.getDelta()
        this.controls.update(delta)
    }
}