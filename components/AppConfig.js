"use strict"
const fs = require("fs");
const path = require('path');
const crypto = require('crypto');

//Symbols
const s_filename = Symbol('filename');
const s_appconfig = Symbol('app-config');

// encryption key
const reverseKeys = ["table", "procedure", "function", "package", "view", "mview", "synonym", "sequence", "type"];
const iv_data = "26ae5cc854e36b6bdfca366848dea6bb";

function makeid() 
{
  const possible = "0123456789abcdefg";
  const length = 32;
  var text = "";
  for (var i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

class AppConfig
{
	constructor(obj)
	{
		this.name = null;
		this.version = null;
		this.description = null;
		
		// Initializing
		if(typeof obj === "object") Object.keys(obj).forEach((key)=>{this[key] = obj[key]})
		this.connections = new ConnectionsConfig(this.connections, this);
		this.schemas = new SchemasConfig(this.schemas, this);
		


		if(this.key == null ) this.key = makeid();
	}
	
	get basePath()
	{
		return path.dirname(this[s_filename])
	}
	save()
	{
		fs.writeFileSync(this[s_filename], JSON.stringify(this, null, 4));
		return this;
	}
	
	static encrypt(decrypted, key)
	{
		
		let b_key = Buffer.from("5ebe2294ecd0e0a08eab7690d2a6ee69", 'hex');
		let b_iv  = Buffer.from(iv_data, 'hex');
		
		const cipher = crypto.createCipheriv('aes-128-cbc', b_key, b_iv);
		var encrypted = cipher.update(decrypted,'utf8','hex')
		encrypted += cipher.final('hex');
		return encrypted;
	}
	
	static decrypt(encrypted, key)
	{
		let b_key = Buffer.from("5ebe2294ecd0e0a08eab7690d2a6ee69", 'hex');
		let b_iv  = Buffer.from(iv_data, 'hex');
		var decipher = crypto.createDecipheriv('aes-128-cbc', b_key, b_iv);
		var decrypted = decipher.update(encrypted,'hex','utf8')
		decrypted += decipher.final('utf8');
		return decrypted;
	}
	
	
	static open(filename)
	{
		let text = fs.readFileSync(filename, 'utf8');
		let parsed = JSON.parse(text);
		let appConfig = new AppConfig(parsed);
		appConfig[s_filename] = filename;
		return appConfig
	}
	
	static new(filename)
	{
		let parsed = {};
		let appConfig = new AppConfig(parsed);
		appConfig[s_filename] = filename;
		return appConfig
	}
};

class SchemasConfig
{
	constructor(obj, appConfig)
	{
		this[s_appconfig] = appConfig;
		
		if(typeof obj === "object") Object.keys(obj).forEach((key)=>
		{
			this.add(key, new SchemaConfig(obj[key]));
		})
	}

	add(key, val)
	{
		this[key] = val;
		this[key][s_appconfig] = this[s_appconfig];
		return this[key];
	}
}
class SchemaConfig
{
	constructor(obj, appConfig)
	{
		this[s_appconfig] = appConfig;
		this.logicalName=null;
		this.remap=null;
		this.connection="default";
		this.filter = false;
		if(typeof obj === "object") Object.keys(obj).forEach((key)=>{this[key] = obj[key]});
		
		
	}
	
	setFilter(lst, val)
	{
		let sign = "["+Array.from(arguments).map((a)=>{return Array.isArray(a)?"array":typeof a}).join(",")+"]";
		if(sign == '[array,boolean]')
		{
			if(lst.length == 0)
			{
				this.filter = val;
			}
			else if(lst.length == 1)
			{
				if(!reverseKeys.includes(lst[0])) throw new Error("first arg must be one of {"+ reverseKeys.join(",") +"}")

				if(typeof this.filter === "boolean")
				{
					let old = this.filter;
					this.filter = {};
					reverseKeys.forEach((v)=>{this.filter[v] = old})
				}
				if(typeof this.filter === "undefined")
				{
					this.filter = {};
					reverseKeys.forEach((v)=>{this.filter[v] = !val})
				}
				this.filter[lst[0]] = val;
			}
			else if(lst.length > 1)
			{
				if(!reverseKeys.includes(lst[0])) throw new Error("first arg must be one of {"+ reverseKeys.join(",") +"}")
				if(typeof this.filter === "boolean")
				{
					let old = this.filter;
					this.filter = {};
					reverseKeys.forEach((v)=>{this.filter[v] = old})
				}
				if(typeof this.filter === "undefined")
				{
					this.filter = {};
					reverseKeys.forEach((v)=>{this.filter[v] = !val})
				}
				if(typeof this.filter[lst[0]] === "boolean") this.filter[lst[0]] ={};
				for (let i=1; i<lst.length;i++)
				{
					this.filter[lst[0]][lst[i]] = val;
				}
			}
		}
		else throw new Error("Invalid signature " + sign);
		return this;
	}
}



class ConnectionsConfig
{
	constructor(obj, appConfig)
	{
		this[s_appconfig] = appConfig;
		if(typeof obj === "object") Object.keys(obj).forEach((key)=>
		{
			this.add(key, new ConnectionConfig(obj[key]));
		})
	}
	
	add(key, val)
	{
		if(typeof this[s_appconfig] === "undefined") throw new Error('typeof this[s_appconfig] === "undefined"')
		this[key] = val;
		this[key][s_appconfig] = this[s_appconfig];
		return this[key];
	}
}
class ConnectionConfig
{
	constructor(obj)
	{
		if(typeof obj === "object") Object.keys(obj).forEach((key)=>{this[key] = obj[key]})
	}
	
	get password()
	{
		return AppConfig.decrypt(this.encryptedPassword, this[s_appconfig].key)
	}
	set password(value)
	{
		
		this.encryptedPassword = AppConfig.encrypt(value, this[s_appconfig].key)
	}
}
module.exports = {AppConfig, SchemasConfig, SchemaConfig, ConnectionsConfig, ConnectionConfig};

