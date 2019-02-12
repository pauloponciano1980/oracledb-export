const ArgumentParser = require('argparse').ArgumentParser;
const fs = require("fs");
const oracledb = require("oracledb");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const AllTablesDao = require("./dao/AllTablesDao");
const AllSequencesDao = require("./dao/AllSequencesDao.js");
const AllObjectsDao = require("./dao/AllObjectsDao.js");
const AllViewsDao = require("./dao/AllViewsDao.js");
const AllTypesDao = require("./dao/AllTypesDao.js");
const AllMviewsDao = require("./dao/AllMviewsDao.js");
const AllSynonymsDao = require("./dao/AllSynonymsDao.js");
const AllConstraintsDao = require("./dao/AllConstraintsDao.js");
const MetadataService = require("./services/MetadataService");
const ForwardController = require("./ForwardController");
const path = require("path");
const package = require("./package.json");
Array.prototype.asyncForEach = async function(fn)
{
	let promises = [];
	for (let i = 0; i < this.length; i++) 
	{
		promises[i] = fn(this[i], i, this);
	}
	return await Promise.all(promises);
};
let service =
{
	setproject : async function(args)
	{
		let configObj;
		if(fs.existsSync(args.file))
		{
			 configObj = JSON.parse(fs.readFileSync(args.file, 'utf8'));
		}
		else
		{
			configObj={}
		};
		[
			"project_name", 
			"project_version", 
			"project_description", 
			"connection_reverse", 
			"username_reverse",
			"target_forward"
		].forEach((key)=>
		{
			if(args[key]) {configObj[key] = args[key]}
		});
		fs.writeFileSync(args.file, JSON.stringify(configObj,null,4));
		return 0;
	},
	setschema: async function(args)
	{
		let configObj;
		if(fs.existsSync(args.file))
		{
			 configObj = JSON.parse(fs.readFileSync(args.file, 'utf8'));
		}
		else
		{
			throw new Error('Project file "' + args.file+ '" does not exists')
		};
		if(!configObj.schemas) configObj.schemas={};
		if(!configObj.schemas[args.schema_name]) configObj.schemas[args.schema_name] = {};
		let schema = configObj.schemas[args.schema_name];
		if(args["schema_reverse"]) {schema["schema_reverse"] = args["schema_reverse"]}
		if(args["schema_forward"]) {schema["schema_forward"] = args["schema_forward"]}
		["tables", "procedures", "functions", "packages", "types", "views", "mviews", "synonyms", "sequences" ].forEach((ent)=>
		{
			if(!schema[ent]) schema[ent] = {};
			if(!schema[ent].add) schema[ent].add = ["%"];
			if(!schema[ent].remove) schema[ent].remove = [];
			if(args["rem_" + ent + ""])
			{
				args["rem_" + ent + ""].forEach((item)=>
				{
					item = item.split("*").join("%")
					if(!schema[ent].remove.includes(item)){schema[ent].remove.push(item)}
					if(schema[ent].add.includes(item)){schema[ent].add.splice(schema[ent].add.indexOf(item),1)}
				})
			}
			if(args["add_" + ent + ""])
			{
				args["add_" + ent + ""].forEach((item)=>
				{
					item = item.split("*").join("%")
					if(!schema[ent].add.includes(item)){schema[ent].add.push(item)}
					if(schema[ent].remove.includes(item)){schema[ent].remove.splice(schema[ent].remove.indexOf(item),1)}
				});
			}
		});
		fs.writeFileSync(args.file, JSON.stringify(configObj,null,'\t'));
		return 0;
	},
	exportsql: async function(args)
	{
		let configObj;
		if(fs.existsSync(args.file))
		{
			 configObj = JSON.parse(fs.readFileSync(args.file, 'utf8'));
		}
		else
		{
			throw new Error('Project file "' + args.file+ '" does not exists')
		};
		["connection_reverse", "username_reverse", "password_reverse", "target_forward"].forEach((key)=>
		{
			if(args[key]) {configObj[key] = args[key]}
		});
		let connection = await oracledb.getConnection(
		{
			"connectString": configObj.connection_reverse, 
			"user":  configObj.username_reverse,
			"password":  configObj.password_reverse
		});
		//Data Discover
		let allTablesDao = new AllTablesDao(connection);
		let allSequencesDao = new AllSequencesDao(connection);
		let allObjectsDao = new AllObjectsDao(connection);
		let allViewsDao =  new AllViewsDao(connection);
		let allTypesDao =  new AllTypesDao(connection);
		let allMviewsDao =  new AllMviewsDao(connection);
		let allSynonymsDao = new AllSynonymsDao(connection);
		let allConstraintsDao = new AllConstraintsDao(connection);
		let revObjects = [];
		await Object.keys(configObj.schemas).asyncForEach(async (schemaKey) =>
		{
			let schema = configObj.schemas[schemaKey];
			// Tables
			{
				let rows = 
				await allTablesDao.find(
				{
					owner: schema.schema_reverse, 
					tableNameLike: schema.tables.add, 
					tableNameNotLike: schema.tables.remove
				});
				rows.forEach( (row)=>
				{
					revObjects.push({type: "TABLE", name: row.tableName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// Sequences
			{
				let rows = await allSequencesDao.find({sequenceOwner: schema.schema_reverse, sequenceNameLike: schema.sequences.add, sequenceNameNotLike: schema.sequences.remove});
				rows.forEach( (row)=>
				{
					revObjects.push({type: "SEQUENCE", name: row.sequenceName, "owner": row.sequenceOwner, "logicalSchema": schemaKey});
				});
			}
			// Procedures
			{
				let rows = await allObjectsDao.find({owner: schema.schema_reverse, objectNameLike: schema.procedures.add, objectNameNotLike: schema.procedures.remove, objectType: "PROCEDURE"});
				rows.forEach( (row)=>
				{
					revObjects.push({type: row.objectType, name: row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// Functions
			{
				let rows = await allObjectsDao.find({owner: schema.schema_reverse, objectNameLike: schema.functions.add, objectNameNotLike: schema.functions.remove, objectType: "FUNCTION"});
				rows.forEach( (row)=>
				{
					revObjects.push({type: row.objectType, name: row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// PACKAGE_SPECIFICATION
			{
				let rows = await allObjectsDao.find(
				{
					"owner": schema.schema_reverse, 
					"objectNameLike": schema.packages.add, 
					"objectNameNotLike": schema.packages.remove, 
					"objectType": "PACKAGE"
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "PACKAGE_SPECIFICATION", "name": row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// PACKAGE_BODY
			{
				let rows = await allObjectsDao.find(
				{
					"owner": schema.schema_reverse, 
					"objectNameLike": schema.packages.add, 
					"objectNameNotLike": schema.packages.remove, 
					"objectType": "PACKAGE BODY"
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "PACKAGE_BODY", "name": row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// TYPE_SPECIFICATION
			{
				let rows = await allObjectsDao.find(
				{
					"owner": schema.schema_reverse, 
					"objectNameLike": schema.packages.add, 
					"objectNameNotLike": schema.packages.remove, 
					"objectType": "TYPE"
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "TYPE_SPECIFICATION", "name": row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// TYPE_BODY
			{
				let rows = await allObjectsDao.find(
				{
					"owner": schema.schema_reverse, 
					"objectNameLike": schema.packages.add, 
					"objectNameNotLike": schema.packages.remove, 
					"objectType": "TYPE BODY"
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "TYPE_BODY", "name": row.objectName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// Views
			{
				let rows = await allViewsDao.find(
				{
					"owner": schema.schema_reverse, 
					"viewNameLike": schema.views.add, 
					"viewNameNotLike": schema.views.remove
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "VIEW", "name": row.viewName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// MViews
			{
				let rows = await allMviewsDao.find(
				{
					"owner": schema.schema_reverse, 
					"mviewNameLike": schema.mviews.add, 
					"mviewNameNotLike": schema.mviews.remove
				});
				rows.forEach( (row)=>
				{
					revObjects.push({"type": "MATERIALIZED_VIEW", "name": row.mviewName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
			// synonyms
			{
				let rows = await allSynonymsDao.find(
				{
					"owner": schema.schema_reverse, 
					"synonymNameLike": schema.mviews.add, 
					"synonymNameNotLike": schema.mviews.remove
				});
				rows.forEach( (row)=> {revObjects.push({"type": "SYNONYM", "name": row.synonymName, "owner": row.owner, "logicalSchema": schemaKey});
				});
			}
		});
		const base_path = path.join(__dirname, path.dirname(args.file), configObj.target_forward);
		const remapSchema = {"MYNODEAPP": "CUPCAKE"}
		let forwardController = new ForwardController();
		forwardController
		
		.config("remapSchema", remapSchema)
		.config("base_path", base_path)
		.config("lstObjects", revObjects)
		.config("metadataService", new MetadataService(connection, forwardController.config("remapSchema")))
		.state("SEQUENCE",
		{
			forwardPath: "/<%=logicalSchema%>/01_Sequences/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getSequenceDDL({owner, name})}]},
		})
		.state("TABLE",
		{
			forwardPath: "/<%=logicalSchema%>/02_Tabelas/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getTableDDL({owner, name})}]},
		})
		.state("DATA",
		{
			forwardPath: "/<%=logicalSchema%>/04_Inserts/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ data: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getData({owner, name})}]},
		})
		.state("INDEX",
		{
			forwardPath: "/<%=logicalSchema%>/05_Indices/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getIndexDDL({owner, name})}]},
		})
		.state("FOREIGN_KEY",
		{
			forwardPath: "/<%=logicalSchema%>/05_Indices/<%-tableName%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getForeignKeyDDL({owner, name})}]},
		})
		.state("VIEW",
		{
			forwardPath: "/<%=logicalSchema%>/06_Views/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getViewDDL({owner, name})}]},
		})
		.state("MATERIALIZED_VIEW",
		{
			forwardPath: "/<%=logicalSchema%>/07_Materialized_Views/<%-name%>.sql",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getMviewDDL({owner, name})}]},
		})
		.state("TYPE_SPECIFICATION",
		{
			forwardPath: "/<%=logicalSchema%>/08_Types/<%-name%>.tps",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getTypeSpecDDL({owner, name})}]},
		})
		.state("TYPE_BODY",
		{
			forwardPath: "/<%=logicalSchema%>/08_Types/<%-name%>.tpb",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getTypeBodyDDL({owner, name})}]},
		})
		.state("PROCEDURE",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.prc",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getProcedureDDL({owner, name})}]},
		})
		.state("FUNCTION",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.fnc",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getFunctionDDL({owner, name})}]},
		})
		.state("PACKAGE_SPECIFICATION",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.pks",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getPackageSpecDDL({owner, name})}]},
		})
		.state("PACKAGE_BODY",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.pkb",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getPackageBodyDDL({owner, name})}]},
		})
		.state("TRIGGER",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.trg",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getTriggerDDL({owner, name})}]},
		})
		.state("SYNONYM",
		{
			forwardPath: "/<%=logicalSchema%>/10_Sinonimos/<%-name%>.trg",
			templatePath: './templates/module.ejs',
			resolve:{ ddl: ["owner", "name", "metadataService", (owner, name, metadataService)=> {return metadataService.getSynonymDDL({owner, name})}]},
		});
		let res = await forwardController.execute();
		connection.close()
		return res;
	}
};
var module = new Module(service);
module.run()
.then((p)=>
{
	console.log("sucesso",p); 
	process.exit(0);
})
.catch((e)=>
{
	console.error("error", e); 
	process.exit(1)
});
 
function Module(service)
{
	this._service = service;
	this.parseArgs = () =>
	{
		let parser = new ArgumentParser
		({
			prog: package.name,
			version: package.version,
			addHelp:true,
			description: package.description,
		});
		let subparsers = parser.addSubparsers({dest: "subcommand"});
		{
			let subparser = subparsers.addParser('setproject', {addHelp:true});
			subparser.addArgument(['-f',  '--file' ], { help: 'Configuration File', dest:"file" , action: 'store', required:true});
			subparser.addArgument(['-pn', '--project-name' ], { help: 'Project Name', action: 'store'});
			subparser.addArgument(['-pv', '--project-version' ], { help: 'Project Version', action: 'store'});
			subparser.addArgument(['-pd', '--project-description' ], { help: 'Project Description', action: 'store'});
			subparser.addArgument(['-cr', '--connection-reverse' ], { help: 'Connection', action: 'store'});
			subparser.addArgument(['-ur', '--username-reverse' ], { help: 'User Name', action: 'store'});
			subparser.addArgument(['-tf', '--target-forward' ], { help: 'Target Forward', action: 'store'});
		};
		{
			let subparser = subparsers.addParser('setschema', {addHelp:true});
			subparser.addArgument(['-f',  '--file' ], { help: 'Configuration File', dest:"file" , action: 'store', required:true});
			subparser.addArgument(['-sn', '--schema-name' ], { help: 'Project Name', action: 'store'});
			subparser.addArgument(['-sr', '--schema-reverse' ], { help: 'Schema Reverse', action: 'store'});
			subparser.addArgument(['-sf', '--schema-forward' ], { help: 'Schema Forward', action: 'store'});
			subparser.addArgument(['-at', '--add-tables' ],      {  dest:"add_tables",      help: 'Adiciona Tabela',    nargs:'*'});
			subparser.addArgument(['-rt', '--rem-tables' ],      {  dest:"rem_tables",      help: 'Remove Tabela',      nargs:'*'});
			subparser.addArgument(['-ap', '--add-procs' ],       {  dest:"add_procedures",  help: 'Adiciona Procedure', nargs:'*'});
			subparser.addArgument(['-rp', '--rem-procs' ],       {  dest:"rem_procedures",  help: 'Remove Procedure',   nargs:'*'});
			subparser.addArgument(['-ak', '--add-packs' ],       {  dest:"add_packages",    help: 'Adiciona Package',   nargs:'*'});
			subparser.addArgument(['-rk', '--rem-packs' ],       {  dest:"rem_packages",    help: 'Remove Package',     nargs:'*'});
			subparser.addArgument(['-ay', '--add-types' ],       {  dest:"add_types",       help: 'Adiciona Type',      nargs:'*'});
			subparser.addArgument(['-ry', '--rem-types' ],       {  dest:"rem_types",       help: 'Remove Type',        nargs:'*'});
			subparser.addArgument(['-av', '--add-views' ],       {  dest:"add_views",       help: 'Adiciona View',      nargs:'*'});
			subparser.addArgument(['-rv', '--rem-views' ],       {  dest:"rem_views",       help: 'Remove View',        nargs:'*'});
			subparser.addArgument(['-am', '--add-mviews' ],      {  dest:"add_mviews",      help: 'Adiciona MView',     nargs:'*'});
			subparser.addArgument(['-rm', '--rem-mviews' ],      {  dest:"rem_mviews",      help: 'Remove MView',       nargs:'*'});
			subparser.addArgument(['-as', '--add-synonym' ],     {  dest:"add_synonyms",    help: 'Adiciona Synonym',   nargs:'*'});
			subparser.addArgument(['-rs', '--rem-synonym' ],     {  dest:"rem_synonyms",    help: 'Remove Synonym',     nargs:'*'});
		};
		{
			let subparser = subparsers.addParser('exportsql', {addHelp:true});
			subparser.addArgument(['-f',  '--file' ], { help: 'Configuration File', dest:"file" , action: 'store', required:true});
			subparser.addArgument(['-cr', '--connection-reverse' ], { help: 'Connection', action: 'store'});
			subparser.addArgument(['-ur', '--username-reverse' ], { help: 'User Name', action: 'store'});
			subparser.addArgument(['-pr', '--password-reverse' ], { help: 'Password', action: 'store'});
			subparser.addArgument(['-tf', '--target-forward' ], { help: 'Target Forward', action: 'store'});
		};
		let args = parser.parseArgs();
		return args;
	};
	this.run = async () =>
	{
		let args = this.parseArgs();
		if(typeof this._service[args.subcommand] === 'undefined') throw new Error("service."+ args.subcommand + " not implemented");
		let subcommand = this._service[args.subcommand];
		return await subcommand(args)
	};
}
