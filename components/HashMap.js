"use strict"
function HashMap(ofClass)
{
	return class HashMap  
	{
		constructor(obj) 
		{
			this.baseClass = ofClass
		}

		item(key, value)
		{
			if(typeof value === "undefined") return this[key]
			else if(value instanceof this.baseClass)
			{
				this[key] = value;
				return this;
			}
			else
			{
				this[key] = new this.baseClass(value);
				return this;
			}
		}
		
		async mapAsync(callback)
		{
			let lst = Object.keys(this);
			let ret = [];
			for(let i =0;i<lst.length;i++)
			{
				let key = lst[i];
				let value = this[key];
				
				if(value instanceof this.baseClass) 
				{
					ret.push(await callback(value, key));
				}	
			}
			return ret;
		}
		async forEachAsync(callback)
		{
			let lst = Object.keys(this)
			for(let i =0;i<lst.length;i++)
			{
				let key = lst[i];
				let value = this[key];
				if(value instanceof this.baseClass) 
				{
					await callback(value, key);
				}	
			}
		}
		
		initialize(obj)
		{
			if(this.nativeAttrs=="undefined") 
			{
				this.nativeAttrs = Object.keys(this).push("nativeAttrs")
			}
			Object.keys(obj).forEach((key)=>
			{
				this.item(key, obj[key])
			})
		}
		
		forEach(callback)
		{
			Object.keys(this).forEach((key)=>
			{
				if(this[key] instanceof this.baseClass) callback(this[key], key);
			})
		}
		
		filter(callback)
		{
			let res = new this.constructor({baseClass:this.baseClass});
			Object.keys(this).forEach((key)=>
			{
				if(this[key] instanceof this.baseClass) if(callback(this[key], key)) res.item(key,this[key]);
			});
			return res;
		}
	}
}
module.exports=HashMap  