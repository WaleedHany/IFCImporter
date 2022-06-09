onmessage = function(message)
{
    for (const obj of message.elements) 
    {
        // highlight intersected object
        obj.select(message.selectedMaterial, message.scene)
    }
    postMessage('ok, done')
}