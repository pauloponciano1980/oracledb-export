class Controller
{
	constructor(param)
	{
		let myarr = Array.from(param)
		this.action = myarr.pop();
		this.injectKeys = myarr;
	}
	
	prepare()
	{
		let instance = new ControllerInstance(this);
		instance.inject(this);
		return instance;
	}
}

class ControllerInstance
{
	constructor(controller)
	{
		this.values = {};
		this.controller = controller;
		this.parameters = [];
	}
	
	inject(obj)
	{
		
		if(typeof arguments[0] === "object")
		{
			this.controller.injectKeys.forEach((key)=>
			{
				//console.log("key", key)
				this.values[key] = obj[key];
			})
		}
		else if(Array.isArray(arguments[0]) && Array.isArray(arguments[1]))
		{
			throw new Error("not Implemented")
		}
		else throw new Error("Invalid signature")
		return this
	
	}
	
	params(arr)
	{
		if(Array.isArray(arguments[0]) && arguments.length==1)
		{
			this.parameters = arr;
		}
		else throw new Error("Invalid signature")
		return this
	}
	
	exec(args)
	{
		// injecting args
		this.parameters.forEach((argname,ix)=>
		{
			let argval = arguments[ix];
			this.values[argname] = argval;
		})
		// executing
		return this.controller.action.apply(this.controller, this.values);
	}
}
module.exports = Controller;