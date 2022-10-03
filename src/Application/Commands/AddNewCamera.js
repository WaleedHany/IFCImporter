import Command from "./Command.js";
import Camera from "../Camera.js"

export default class AddNewCamera extends Command
{
  static number = 0
    constructor(sizes, scene, canvas, isPrespective, cameraList, isVerticalSplit) 
    {
      super()
      this.sizes = sizes
      this.scene = scene
      this.canvas = canvas
      this.isPrespective = isPrespective
      this.cameraList = cameraList
      this.isVerticalSplit = isVerticalSplit
      AddNewCamera.number += 1
    }

    execute()
    {
      console.log(this.isVerticalSplit)
      if (Camera.numberOfScreens < 4)
      {
        if (AddNewCamera.number == 2 || AddNewCamera.number == 3)
        {
          if (this.isVerticalSplit) this.isVerticalSplit = false
          else this.isVerticalSplit = true
        }  
        this.camera = new Camera(this.sizes, this.scene, this.canvas, this.isPrespective)
        this.cameraList.push(this.camera)
        let cameraToSplit = this.cameraList[this.cameraList.length - 2]
        if(Camera.numberOfScreens == 4) cameraToSplit = this.cameraList[0]
        this.camera.parentCamera = cameraToSplit
        let x = cameraToSplit.x;
        let y = cameraToSplit.y;
        if (this.isVerticalSplit)
        {          
          let h = cameraToSplit.height
          let w = cameraToSplit.width / 2
          cameraToSplit.setBoundaries(x, y, w, h)         
          let nx = x + (cameraToSplit.widthRatio)
          this.camera.setBoundaries(nx, y, w, h)    
        }
        else
        {
          let h = cameraToSplit.height / 2
          let w = cameraToSplit.width
          cameraToSplit.setBoundaries(x, y, w, h)
          let ny = y + (cameraToSplit.heightRatio)
          this.camera.setBoundaries(x,ny,w,h)
        }
        this.cameraList.forEach(c => c.controls.enabled = false)
      } 
    }

    undo()
    {
       
    }

    redo()
    {
        
    }

    remove()
    {
       
    }
}