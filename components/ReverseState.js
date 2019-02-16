"use strict"
const Controller = require("./Controller")
class ReverseState
{
	constructor(obj)
	{
		this.preinit(obj)
	}
	
	
	preinit(obj)
	{
		if(this.nativeAttrs=="undefined") 
		{
			this.nativeAttrs = Object.keys(this).push("nativeAttrs")
		}
		if(typeof obj === "object")
		{
			Object.keys(obj).forEach((key)=>
			{
				this[key] = obj[key];
			})
		}
	}
	
	get precondition()
	{
		return this._precondition;
	}
	
	set precondition(value)
	{
		if(value instanceof Controller)
		{
			this._precondition = value;
		}
		else
		{
			this._precondition = new Controller(value);
		}
	}
}
module.exports = ReverseState