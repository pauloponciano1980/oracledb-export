"use strict"
class Resolvable
{
	constructor(obj) 
	{
		this.resolve = {};
		if(typeof obj === "object") Object.keys(obj).forEach((atr) => {this[atr]=obj[atr]})
	}

	async getResolve()
	{
		let reqLst = Object.keys(this.resolve);
		let resObj = {};
		for(let reqIdx in reqLst)
		{
			let reqKey = reqLst[reqIdx];
			let args = Array.from(this.resolve[reqKey])
			let vals = new Array(args.length-1)
			let myfunc = args.pop();
			
			//injetando arguments
			let injectors=Array.from(arguments)
			injectors.forEach((param)=>
			{
				if (typeof param == "object")
				{
					Object.keys(param).forEach((patKey)=>
					{
						let pos = args.indexOf(patKey)
						if(pos>=0)
						{
							if(typeof vals[pos] === "undefined") vals[pos] = param[patKey]
						}
					})
				}
				else {throw new Error(`Invalid argument typeof == "${typeof obj}"`)}
			})
			let resValue = await myfunc.apply(this, vals);
			resObj[reqKey] = resValue;
			return resObj
		}
	}
}

module.exports=Resolvable