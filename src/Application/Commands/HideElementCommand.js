import Command from "./Command.js";

export default class Hide_ShowElementCommand
{
    static Apply(selectedElements, scene, application, hide = true)
    {
      if (application.hasOwnProperty('HiddenElements'))
      {
        if (hide)
        {
          for(const element of selectedElements)
          {
              element.reset()
            scene.remove(element.mesh)
            application.HiddenElements.push(element)
          }
        }   
        else
        {
          for(const element of  application.HiddenElements)
          {
            scene.add(element.mesh)
          }
          application.HiddenElements = []
        }
      }
     
    }
}