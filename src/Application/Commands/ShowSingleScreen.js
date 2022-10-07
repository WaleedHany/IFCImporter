export default class ShowSingleScreen {

  constructor(init)
  {
    this.sizes = init.sizes
    this.cameraList = init.cameraList
  }

  execute()
  {
    let num = this.cameraList.length -1
    let mainCamera = this.cameraList[0]  
    init.resetCamera()
    for (let i = num; i > 0; i--)
    {
      let camera = this.cameraList[i]
      this.cameraList.pop()
      if (camera.div != null) camera.div.remove()
      camera.div = null
      camera.dispose()
    }
    mainCamera.setBoundaries(0, 0, this.sizes.width, this.sizes.height)
    mainCamera.instance.clearViewOffset ()
    mainCamera.controls.enabled = true
    mainCamera.controls.aspect = mainCamera.sizes.width/mainCamera.sizes.height
  }
}