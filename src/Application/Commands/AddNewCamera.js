import Command from "./Command.js";
import Camera from "../Camera.js"
import { ColorController } from "lil-gui";

export default class AddNewCamera extends Command {

  static number = 0
  constructor(sizes, scene, canvas, isPrespective, cameraList, isVerticalSplit) {
    super()
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    this.isPrespective = isPrespective
    this.cameraList = cameraList
    this.isVerticalSplit = isVerticalSplit
    this.mouseX = 0
    this.mouseY = 0
    this.deltaX = 0
    this.deltaY = 0
    AddNewCamera.number += 1
  }

  execute() {
    console.log(this.isVerticalSplit)
    if (Camera.numberOfScreens < 4) {
      if (AddNewCamera.number == 2 || AddNewCamera.number == 3) {
        if (this.isVerticalSplit) this.isVerticalSplit = false
        else this.isVerticalSplit = true
      }
      this.camera = new Camera(this.sizes, this.scene, this.canvas, this.isPrespective)
      this.cameraList.push(this.camera)
      let cameraToSplit = this.cameraList[this.cameraList.length - 2]
      if (Camera.numberOfScreens == 4) cameraToSplit = this.cameraList[0]
      this.camera.parentCamera = cameraToSplit
      let x = cameraToSplit.x;
      let y = cameraToSplit.y;
      if (this.isVerticalSplit) {
        let h = cameraToSplit.height
        let w = cameraToSplit.width / 2
        cameraToSplit.setBoundaries(x, y, w, h)
        let nx = x + (cameraToSplit.widthRatio)
        this.camera.setBoundaries(nx, y, w, h)
      } else {
        let h = cameraToSplit.height / 2
        let w = cameraToSplit.width
        cameraToSplit.setBoundaries(x, y, w, h)
        let ny = y + (cameraToSplit.heightRatio)
        this.camera.setBoundaries(x, ny, w, h)
      }
      this.addDiv()
      this.camera.div = this.div
      this.cameraList.forEach(c => c.controls.enabled = false)

    }
  }

  addDiv()
  {
    this.div = document.createElement('div')
    if (this.isVerticalSplit) {
      this.div.style.borderLeft = "3px solid rgb(144, 194, 235)";
      this.div.style.height = this.camera.height + 'px'
    }
    else {
      this.div.style.borderBottom = "3px solid rgb(144, 194, 235)";
      this.div.style.width = this.camera.width + 'px'
    }
    this.div.style.top = (this.camera.y * this.camera.sizes.height) - 1 + 'px'
    this.div.style.left = (this.camera.x * this.camera.sizes.width) + 'px'

    this.div.style.cursor = 'move';
    this.div.style.opacity = '0.4';
    this.div.style.position = 'fixed';
    document.body.appendChild(this.div)
    this.div.object = this
    this.div.onmousedown = this.dragMouseDown;
    return this.div
  }

  dragMouseDown(event) {
    event.preventDefault()
    let that = event.currentTarget.object
    // get the mouse cursor position at startup:
    that.mouseX = event.clientX;
    that.mouseY = event.clientY
    that.div.onmouseup = that.closeDragElement
    // call a function whenever the cursor moves:
    that.canvas.object = that
    that.canvas.onmousemove = that.elementDrag
  }

  elementDrag(e) {
    e.preventDefault();
    let that = e.currentTarget.object
    // calculate the new cursor position:
    that.deltaX = that.mouseX - e.clientX
    that.deltaY = that.mouseY - e.clientY
    that.mouseX = e.clientX
    that.mouseY = e.clientY
    if (that.isVerticalSplit) {
      that.div.style.left = (that.div.offsetLeft - that.deltaX) + "px"
      for (let camera of that.cameraList) {
        let midPointY = camera.y + (camera.heightRatio / 2)
        if (midPointY * camera.sizes.height >= that.div.offsetTop &&
          midPointY * camera.sizes.height <= (that.div.offsetTop + that.div.offsetHeight)) {
          let x = that.div.offsetLeft / camera.sizes.width
          if (Math.abs(x - camera.x) < Math.abs(x - (camera.x + camera.widthRatio))) {
            camera.setBoundaries(x, camera.y, (1 - x) * camera.sizes.width, camera.height, false)
          } else {
            camera.setBoundaries(camera.x, camera.y, (camera.x + x) * camera.sizes.width, camera.height, false)
          }
          if (camera.div != null && camera.div.offsetWidth < camera.sizes.width && camera.div.offsetWidth > camera.div.offsetHeight) {
            camera.div.style.left = (camera.x * camera.sizes.width) + 'px'
            camera.div.style.width = camera.width + 'px'
          }
        }
      }
    }               
    else {
      that.div.style.top = (that.div.offsetTop - that.deltaY) + "px"
      for (let camera of that.cameraList) {
        let midPointX = camera.x + (camera.widthRatio / 2)
        if (midPointX * camera.sizes.width >= that.div.offsetLeft &&
          midPointX * camera.sizes.width <= (that.div.offsetLeft + that.div.offsetWidth)) {
          let y = that.div.offsetTop / camera.sizes.height
          if (Math.abs(y - camera.y) < Math.abs(y - (camera.y + camera.heightRatio))) {
            
            camera.setBoundaries(camera.x, y, camera.width, (1 - y) * camera.sizes.height, false)
          }
          else {
            camera.setBoundaries(camera.x, camera.y, camera.width, (camera.y + y) * camera.sizes.height, false)
          }
          if (camera.div != null && camera.div.offsetHeight < camera.sizes.height && camera.div.offsetHeight > camera.div.offsetWidth)
          {
            camera.div.style.Top = (camera.y * camera.sizes.height) + 'px'
            camera.div.style.height = camera.height + 'px'
          } 
        }
      }
    }

  }

  closeDragElement(e) {
    // stop moving when mouse button is released:
    e.currentTarget.object.div.onmouseup = null;
    e.currentTarget.object.canvas.onmousemove = null;
  }

  // undo()
  // {

  // }

  // redo()
  // {

  // }

  // remove()
  // {

  // }
}