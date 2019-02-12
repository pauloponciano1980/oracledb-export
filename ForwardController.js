"use strict"
var util = require('util');
const MetadataService = require("./services/MetadataService")
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
function ForwardController(connection, remapSchema, base_path, lstObjects)
{
	this._state = {};
	this.state = function state(key, value)
	{
		if(arguments.length == 1)
		{
			return this._state[key];
		}
		else if (arguments.length == 2)
		{
			this._state[key] = value;
			return this;
		}
	};
	
	this._config = {};
	this.config = function config(key, value)
	{
		if(arguments.length == 1)
		{
			return this._config[key];
		}
		else if (arguments.length == 2)
		{
			this._config[key] = value;
			return this;
		}
	};	

	this.execute = async function execute()
	{
		
		
		for(let iObject=0; iObject < this._config.lstObjects.length; iObject++)
		{
			let itemObject = this._config.lstObjects[iObject];
			let instParams = {};
			instParams["logicalSchema"] = itemObject.logicalSchema;
			instParams["owner"] = itemObject.owner;
			instParams["name"] = itemObject.name;
			instParams["type"] = itemObject.type;
			let state = this._state[itemObject.type]
			
			//resolving
			if(state.resolve)
			{
				let resKeys = Object.keys(state.resolve)
				let promises=[];
				for(let resId = 0; resId < resKeys.length; resId++)
				{
					let resKey = resKeys[resId];
					let resArgs = Array.from(state.resolve[resKey]);
					let resFunc = resArgs.pop();
					let resValues=[];
					
					for(let iArg=0; iArg < resArgs.length; iArg++)
					{
						if(typeof this.config(resArgs[iArg]) !== "undefined") resValues[iArg] = this.config(resArgs[iArg]);
					}
					
					for(let iArg=0; iArg < resArgs.length; iArg++)
					{
						if(typeof instParams[resArgs[iArg]] !== "undefined")resValues[iArg] = instParams[resArgs[iArg]];
					}

					for(let iArg=0; iArg < resArgs.length; iArg++)
					{
						if(typeof resValues[iArg] === "undefined") throw new Error('Argument "'+resArgs[iArg]+'" is not defined for state "'+itemObject.type+'"');
					}
					
					let xx = resFunc.apply(null, resValues);
					promises.push(xx);
					xx.then((resolved)=>
					{
						instParams[resKey] = resolved
					})
				}
				await Promise.all(promises);
			}
			
			//
			if(typeof state.contentTemplate === "undefined")
			{
				state.contentTemplate = fs.readFileSync(path.join( __dirname, state.templatePath),'utf8');
			}

			if(typeof state.forwardPath === "undefined") throw new Error("forwardPath === 'undefined'");
			let filename = ejs.render(state.forwardPath, instParams);
			let content = ejs.render(state.contentTemplate, instParams);	
			let fullpath = path.join(this.config("base_path"), filename);
			let dir = path.dirname(fullpath);
			if (!fs.existsSync(dir)){fs.mkdirSync(dir, { recursive: true });}
			fs.writeFileSync(fullpath , content);
			console.log(fullpath);
		}
	}
};

module.exports=ForwardController;
