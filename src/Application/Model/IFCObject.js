import {Float32BufferAttribute, Mesh, BufferGeometry, Vector3, Group} from 'three'


export default class IFCObject
{
    constructor(modelID, id, positions =[], normals = [], indeces=[], groups=[], materials=[], ifcLoader)
    {
        this.modelId = modelID
        this.expressID = id
        this.materials = materials
        this.geometry = new BufferGeometry()
        let newPositions = [] 
        let newNormals = []

        for(let i = 0; i < indeces.length; i += 3)
        {
           let ia = indeces[i + 0];
           let ib = indeces[i + 1];
           let ic = indeces[i + 2];
           newPositions.push(positions[ia * 3 + 2])
           newPositions.push(positions[ia * 3 + 0])
           newPositions.push(positions[ia * 3 + 1])
           newPositions.push(positions[ib * 3 + 2])
           newPositions.push(positions[ib * 3 + 0])
           newPositions.push(positions[ib * 3 + 1])
           newPositions.push(positions[ic * 3 + 2])
           newPositions.push(positions[ic * 3 + 0])
           newPositions.push(positions[ic * 3 + 1])

           newNormals.push(normals[ia * 3 + 2])
           newNormals.push(normals[ia * 3 + 0])
           newNormals.push(normals[ia * 3 + 1])
           newNormals.push(normals[ib * 3 + 2])
           newNormals.push(normals[ib * 3 + 0])
           newNormals.push(normals[ib * 3 + 1])
           newNormals.push(normals[ic * 3 + 2])
           newNormals.push(normals[ic * 3 + 0])
           newNormals.push(normals[ic * 3 + 1])     
        }
        const tempGeometry = new BufferGeometry()
        tempGeometry.setAttribute( 'position', new Float32BufferAttribute( newPositions, 3 ) )
        this.position = this.getCenterPoint(tempGeometry)
        let nwerPositions = []
        this.group = new Group()
        for(let i = 0; i < newPositions.length; i += 3)
        {
            nwerPositions.push(newPositions[i + 0] - this.position.x)
            nwerPositions.push(newPositions[i + 1] - this.position.y)
            nwerPositions.push(newPositions[i + 2] - this.position.z)
        }
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( nwerPositions, 3 ) )
        this.geometry.setAttribute( 'normal', new Float32BufferAttribute( newNormals, 3 ) )
        tempGeometry.dispose()
        
        let i = 0
        for(let group of groups)
        {
            this.geometry.addGroup(group.start, group.count, i)
            i++
        }
   
        this.mesh = new Mesh( this.geometry, this.materials )
        this.mesh.modelObject = this
        //this.mesh position.set(new Vector3(this.position.x, this.position.y, this.position.z))

        this.highlightMesh = null
        this.selectionMesh = null
        if(ifcLoader != null)
        this.properties = ifcLoader.getItemProperties(this.modelId, this.expressID); 
    }

    replicate(modelID, id, geometry, materials, properties)
    {
        this.modelId = modelID
        this.expressID = id
        this.materials = materials
        this.geometry = geometry
        this.mesh = new Mesh( this.geometry, this.materials )
        this.mesh.modelObject = this
        this.properties = properties
    }

    highLight(material, scene)
    {
        const tempGeometry = this.geometry.clone()
        tempGeometry.clearGroups()
        this.highlightMesh = new Mesh(tempGeometry, material)
        this.highlightMesh.position.set(this.mesh.position.x, this.mesh.position.y,this.mesh.position.z)
        this.highlightMesh.rotation.set(this.mesh.rotation.x, this.mesh.rotation.y,this.mesh.rotation.z)
        scene.add(this.highlightMesh)
    }

    select(material, scene)
    {
        // const tempGeometry  this.geometry.clone()
        // tempGeometry clearGroups()
        this.selectionMesh = new Mesh(this.geometry, material)
        this.selectionMesh.position.set(this.mesh.position.x, this.mesh.position.y,this.mesh.position.z)
        this.selectionMesh.rotation.set(this.mesh.rotation.x, this.mesh.rotation.y,this.mesh.rotation.z)
        scene.add(this.selectionMesh)
    }

    originalColor(scene)
    {
        if(this.highlightMesh != null && this.highlightMesh.geometry != null)
        {
            scene.remove(this.highlightMesh)
            this.highlightMesh.geometry.dispose()
            this.highlightMesh = null
        }
    }

    unselect(scene)
    {
        if(this.selectionMesh != null && this.selectionMesh.geometry != null)
        {
            scene.remove(this.selectionMesh)
            //this.selectionMesh.geometry.dispose()
            this.selectionMesh = null
        }
    }
    
    reset()
    {
        if(this.highlightMesh != null)
        {
            this.highlightMesh.geometry.dispose()
            this.highlightMesh = null
        }
        if(this.selectionMesh != null)
        {
            this.selectionMesh.geometry.dispose()
            this.selectionMesh = null
        }
    }

    dispose(listOfElements = [])
    {
        if(!listOfElements.some(e => e.mesh.geometry == this.mesh.geometry))
        {
            this.mesh.geometry.clearGroups()
            this.mesh.geometry.dispose()
        }
        this.materials = []
        this.geometry = null
        this.modelId = null
        this.properties = null
        this.expressID = null
        this.mesh = null
        this.reset()
    }

    getCenterPoint(Geometry) {
        var middle = new Vector3();
        var geometry = Geometry;
    
        geometry.computeBoundingBox();
    
        middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
        middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
        middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;
    
        return middle;
    }
}