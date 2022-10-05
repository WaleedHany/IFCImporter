import * as THREE from 'three'
import CameraControls from 'camera-controls';

const clock = new THREE.Clock();

export default class Camera
{
    static numberOfScreens = 0
    constructor(sizes, scene, canvas, isPrespective = true)
    {
        this.sizes  = sizes
        this.scene  = scene
        this.canvas = canvas
        this.isPrespective = isPrespective
        this.setInstance()
        this.setControls()
        this.setBoundaries(0, 0, this.sizes.width, this.sizes.height)
        Camera.numberOfScreens += 1
        this.parentCamera = null
    }

    setInstance()
    {
        if (this.isPrespective)
        {
            this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 4000)
            this.instance.position.set(40, 40, 40)    
            this.instance.lookAt(0,0,0)
        }
        else
        { 
            let aspect = this.sizes.width / this.sizes.height
            this.instance = new THREE.OrthographicCamera(-80, 80, 80 / aspect, -80 / aspect, -1000, 2000)
            this.instance.position.set(0, 1, 0)
            if (Camera.numberOfScreens == 1) this.instance.position.set(0, 0, 1)
            if (Camera.numberOfScreens == 3)this.instance.position.set(1, 0, 0)
        }
        this.instance.up.set(0,0,1)
        this.scene.add(this.instance)
    }

    setControls()
    {
        CameraControls.install({THREE: THREE})
        this.controls = new CameraControls(this.instance, this.canvas)
        this.controls.dampingFactor = 0.1
        this.controls.zoomSpeed  = 0.1
        this.controls.dollyToCursor = true
        this.controls.infinityDolly = true
        this.controls.mouseButtons.left = CameraControls.ACTION.NONE
        this.controls.mouseButtons.middle = CameraControls.ACTION.ROTATE
        this.controls.mouseButtons.right = CameraControls.ACTION.TRUCK
      //  this.controls.boundaryEnclosesCamera
    }

    setBoundaries(x, y, w, h, adjustPosition = true)
    {
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.widthRatio = this.width/this.sizes.width
        this.heightRatio = this.height / this.sizes.height
        this.instance.aspect = this.widthRatio/this.heightRatio
        this.setFieldOfView(x, y, w, h, adjustPosition)
    }

    setFieldOfView(x, y, w, h, adjustPosition = true)
    { 
        let xValue = x * this.sizes.width
        let yValue = y * this.sizes.height
        if (xValue >= 0 && (xValue + w) <= this.sizes.width &&
            w > 0 && h > 0 &&
            yValue >= 0 && (yValue + h) <= this.sizes.height)
        {
            this.instance.setViewOffset(this.sizes.width, this.sizes.height, x * this.sizes.width, y * this.sizes.height, w, h);
            if(Camera.numberOfScreens > 1 && adjustPosition) this.getNewCameraPosition(x,y, this.instance.zoom)
        }   
        this.instance.updateProjectionMatrix()
    }

    getVisibleHeightAtZDepth(depth)
    {
        // compensate for cameras not positioned at z=0
        const cameraOffset = this.instance.position.z;
        if ( depth < cameraOffset ) depth -= cameraOffset;
        else depth += cameraOffset;
      
        if (this.instance.isPerspectiveCamera)
        {
            // vertical fov in radians
            const vFOV = this.instance.fov * Math.PI / 180; 
            // Math.abs to ensure the result is always positive
            return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
        }
        else
        {
            return ( this.instance.top - this.instance.bottom ) / ( 2 * Math.abs( depth ) );
        }

      };
      
    getVisibleWidthAtZDepth(depth)
    {
        if (this.instance.isPerspectiveCamera)
        {
            const height = this.getVisibleHeightAtZDepth(depth);
            return height * this.instance.aspect;
        }
        else {
            return ( this.instance.right - this.instance.left ) / ( 2 * Math.abs( depth ) );
        }
    };

    getNewCameraPosition(x, y, depth)
    {
        // x-axis
        let windowWidth = this.getVisibleWidthAtZDepth(depth)
        let startPointX = x
        if (Math.abs(0.5 - x) > Math.abs(0.5 - (x + this.widthRatio))) startPointX = x + this.widthRatio
        let eccentricityX = Math.abs(0.5 - startPointX)
        if((x - 0.5)*((x + this.widthRatio)-0.5) <= 0) eccentricityX *= -1
        let midpointX = (eccentricityX + 0.5) * windowWidth 
        let factorX = 1
        if (x >= 0.5) factorX = -1
        // y-axis
        let windowheight = this.getVisibleHeightAtZDepth(depth)
        let startPointY = y
        if (Math.abs(0.5 - y) > Math.abs(0.5 - (y + this.heightRatio))) startPointY = y + this.heightRatio
        let eccentricityY = Math.abs(0.5 - startPointY)
        if((y - 0.5)*((y + this.heightRatio)-0.5) <= 0) eccentricityY *= -1
        let midpointY = (eccentricityY + 0.5) * windowheight 
        let factorY = 1
        if (y >= 0.5) factorY = -1
        this.controls.setFocalOffset(midpointX * factorX, midpointY * factorY, 0, true)
    }

    isMouseOver(x, y)
    {
        if (x >= this.x && x <= this.x + (this.width / this.sizes.width) &&
            y >= this.y && y <= this.y + (this.height / this.sizes.height) && !this.controls.enabled)
        {
            return this
        }
        return null
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