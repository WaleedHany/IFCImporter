// Command main class
export default class Command
{
    constructor() 
    {
		this.inMemory = false;
		this.updatable = false;
		this.type = '';
		this.name = '';
	}
    
    execute()
    {}

    undo()
    {}

    redo()
    {}

    remove()
    {}

	toJSON() 
    {
		const output = {};
		output.type = this.type;
		output.id = this.id;
		output.name = this.name;
		return output;
	}

	ReadFromJSON() 
    {
		this.inMemory = true;
		this.type = json.type;
		this.id = json.id;
		this.name = json.name;
	}

}