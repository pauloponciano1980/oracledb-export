"use strict";

//node_modules
const YAML = require("yaml");
const fs = require("fs");
const oracledb = require("oracledb");
const util = require("util");
const ejs = require("ejs");
const path = require("path");

// Root Directory
const __rootdir = path.join( __dirname, ".." )

const MetadataService = require(`${__rootdir}/components/MetadataService`);
const ForwardController = require(`${__rootdir}/components/ForwardController`);
const {AppConfig, SchemasConfig, SchemaConfig, ConnectionsConfig, ConnectionConfig} = require(`${__rootdir}/components/AppConfig`);
const parser = require(`${__rootdir}/components/parser`)
const HashMap = require(`${__rootdir}/components/HashMap`)
const Resolvable = require(`${__rootdir}/components/Resolvable`)
const ReverseState = require(`${__rootdir}/components/ReverseState`);

// Data Access Objects
const AllTablesDao = require(`${__rootdir}/dao/AllTablesDao`);
const AllSequencesDao = require(`${__rootdir}/dao/AllSequencesDao.js`);
const AllViewsDao = require(`${__rootdir}/dao/AllViewsDao.js`);
const AllTypesDao = require(`${__rootdir}/dao/AllTypesDao.js`);
const AllMviewsDao = require(`${__rootdir}/dao/AllMviewsDao.js`);
const AllSynonymsDao = require(`${__rootdir}/dao/AllSynonymsDao.js`);
const AllProceduresDao = require(`${__rootdir}/dao/AllProceduresDao.js`);
const AllFunctionsDao = require(`${__rootdir}/dao/AllFunctionsDao.js`);
const AllPackageSpecsDao = require(`${__rootdir}/dao/AllPackageSpecsDao.js`);
const AllPackageBodysDao = require(`${__rootdir}/dao/AllPackageBodysDao.js`);
const AllTypeSpecsDao = require(`${__rootdir}/dao/AllTypeSpecsDao.js`);
const AllTypeBodysDao = require(`${__rootdir}/dao/AllTypeBodysDao.js`);


const rvOptions =
{
	
}

//Data Discover
class ReverseMap extends HashMap(ReverseState)
{
	constructor(cnx)
	{
		super();
		this.cnx=cnx
		this
		.item("TABLE",
		{
			filterKey: "table",
			daoClass: AllTablesDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("SEQUENCE",
		{
			filterKey: "sequence",
			daoClass: AllSequencesDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("PROCEDURE",
		{
			filterKey: "procedure",
			daoClass: AllProceduresDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("FUNCTION",
		{
			filterKey: "function",
			daoClass: AllFunctionsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("VIEW",
		{
			filterKey: "view",
			daoClass: AllViewsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("MATERIALIZED_VIEW",
		{
			filterKey: "mview",
			daoClass: AllMviewsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("SYNONYM",
		{
			filterKey: "synonym",
			daoClass: AllSynonymsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("PACKAGE_SPECIFICATION",
		{
			filterKey: "package",
			daoClass: AllPackageSpecsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("PACKAGE_BODY",
		{
			filterKey: "package",
			daoClass: AllPackageBodysDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("TYPE_SPECIFICATION",
		{
			filterKey: "type",
			daoClass: AllTypeSpecsDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		})
		.item("TYPE_BODY",
		{
			filterKey: "type",
			daoClass: AllTypeBodysDao,
			precondition: ["rvOptions", "schemaConfig", function(rvOptions, schemaConfig){return true}],
		});
	}
	
	async discover(schemaKey, schema)
	{
		let allMaps = await this.mapAsync(async (state,stateKey)=>
		{
			//let inst = state.precondition.prepare().params(["rvOptions", "schemaConfig"]).exec(rvOptions, schema);
			//if(!inst) return [];
			let filterKey = state.filterKey;
			let logicalSchema = schema.logicalName;
			let fltObj = schema.filter[filterKey];
			let actLst = Object.keys(fltObj);
			let nameLike;
			let nameNotLike;
			if(typeof schema.filter[filterKey] === "object") nameLike		= Object.keys(schema.filter[filterKey]).filter((key)=>{return	schema.filter[filterKey][key]}).map((v)=>{return v.split("*").join("%")});
			if(typeof schema.filter[filterKey] === "object") nameNotLike	= Object.keys(schema.filter[filterKey]).filter((key)=>{return	!schema.filter[filterKey][key]}).map((v)=>{return v.split("*").join("%")});
			let actObj = fltObj[stateKey]
			let DAO = state.daoClass
			let dao = new DAO(this.cnx);
			let rows = await dao.find({owner: schemaKey, nameLike, nameNotLike});
			let resp = rows.map((row)=>{return {type: stateKey, name: row.name, "owner": row.owner, logicalSchema}});
			return resp;
		})
		let uniquelist = [].concat.apply([], allMaps)
		return uniquelist;
	}
};

//Forward DDL
class ForwardMap extends HashMap(Resolvable)
{
	constructor(connection, remapSchema)
	{
		super();
		this.metadataService = new MetadataService(connection);
		this.remapSchema = remapSchema;
		this
		.item("SEQUENCE",
		{
			forwardPath: "/<%=logicalSchema%>/01_Sequences/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getSequenceDDL({owner, name}, this.remapSchema)}]},
		})
		.item("TABLE",
		{
			forwardPath: "/<%=logicalSchema%>/02_Tabelas/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getTableDDL({owner, name}, this.remapSchema)}]},
		})
		.item("DATA",
		{
			forwardPath: "/<%=logicalSchema%>/04_Inserts/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ data: ["owner", "name", (owner, name)=> {return this.metadataService.getData({owner, name}, this.remapSchema)}]},
		})
		.item("INDEX",
		{
			forwardPath: "/<%=logicalSchema%>/05_Indices/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getIndexDDL({owner, name}, this.remapSchema)}]},
		})
		.item("FOREIGN_KEY",
		{
			forwardPath: "/<%=logicalSchema%>/05_Indices/<%-tableName%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getForeignKeyDDL({owner, name}, this.remapSchema)}]},
		})
		.item("VIEW",
		{
			forwardPath: "/<%=logicalSchema%>/06_Views/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getViewDDL({owner, name}, this.remapSchema)}]},
		})
		.item("MATERIALIZED_VIEW",
		{
			forwardPath: "/<%=logicalSchema%>/07_Materialized_Views/<%-name%>.sql",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getMviewDDL({owner, name}, this.remapSchema)}]},
		})
		.item("TYPE_SPECIFICATION",
		{
			forwardPath: "/<%=logicalSchema%>/08_Types/<%-name%>.tps",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getTypeSpecDDL({owner, name}, this.remapSchema)}]},
		})
		.item("TYPE_BODY",
		{
			forwardPath: "/<%=logicalSchema%>/08_Types/<%-name%>.tpb",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getTypeBodyDDL({owner, name}, this.remapSchema)}]},
		})
		.item("PROCEDURE",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.prc",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getProcedureDDL({owner, name}, this.remapSchema)}]},
		})
		.item("FUNCTION",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.fnc",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getFunctionDDL({owner, name}, this.remapSchema)}]},
		})
		.item("PACKAGE_SPECIFICATION",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.pks",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getPackageSpecDDL({owner, name}, this.remapSchema)}]},
		})
		.item("PACKAGE_BODY",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.pkb",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getPackageBodyDDL({owner, name}, this.remapSchema)}]},
		})
		.item("TRIGGER",
		{
			forwardPath: "/<%=logicalSchema%>/09_Programaveis/<%-name%>.trg",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getTriggerDDL({owner, name}, this.remapSchema)}]},
		})
		.item("SYNONYM",
		{
			forwardPath: "/<%=logicalSchema%>/10_Sinonimos/<%-name%>.trg",
			templatePath: `${__rootdir}/templates/module.ejs`,
			resolve:{ ddl: ["owner", "name", (owner, name)=> {return this.metadataService.getSynonymDDL({owner, name}, this.remapSchema)}]},
		});
	}
	
	async forward(lstObjects, basePath)
	{
		for (let ixObject in lstObjects)
		{
			let obj = lstObjects[ixObject]
			let fwConfig = this.item(obj.type)
			let fwInstance = Object.assign(fwConfig, obj)
			let resolved = await fwInstance.getResolve(fwInstance)
			let fwInstResolved = Object.assign(fwInstance, resolved)
			let filename = ejs.render(fwInstResolved.forwardPath, fwInstResolved);
			let contentTemplate = fs.readFileSync(fwInstResolved.templatePath, 'utf8');
			let content = ejs.render(contentTemplate, fwInstResolved);	
			let fullpath = path.join(basePath, filename);
			let dir = path.dirname(fullpath);
			if (!fs.existsSync(dir)){fs.mkdirSync(dir, { recursive: true });}
			fs.writeFileSync(fullpath, content);
			console.log(fullpath)
		}
	}
};

function loadConfig(args)
{
	let appConfig;
	if(args.file)
	if(fs.existsSync(args.file))
	{
		appConfig = AppConfig.open(args.file)
	}
	else
	{
		appConfig = AppConfig.new(args.file)
	};
	if(args.name) appConfig.name = args.name;
	if(args.version) appConfig.version = args.version;
	if(args.description) appConfig.description = args.description;
	let connection;
	if(args.connection)
	{
		connection = (typeof appConfig.connections["default"] === "undefined" || appConfig.connections["default"]==null)? appConfig.connections.add("default", new ConnectionConfig()): appConfig.connections["default"];
		connection.user = args.connection[0];
		connection.password = args.connection[1];
		connection.connectString = args.connection[2];
	}
	let schema;
	if(args.schema)
	{
		schema = (typeof appConfig.schemas[args.schema] === "undefined" || appConfig.schemas[args.schema]==null)? appConfig.schemas.add(args.schema, new SchemaConfig()): appConfig.schemas[args.schema];
	}
	if(args.remap) schema.remap = args.remap;
	if(args.logicalName) schema.logicalName = args.logicalName;
	if(args.add)
	{
		args.add.forEach((paramFilter)=>{schema.setFilter(paramFilter, true)})
	}
	if(args.rem)
	{
		args.rem.forEach((paramFilter)=>{ schema.setFilter(paramFilter, false)})
	}
	return appConfig;
}


async function exportsql(appConfig)
{
	let schemaKeys = Object.keys(appConfig.schemas)
	for(let schIdx=0; schIdx<schemaKeys.length; schIdx++)
	{
		let schemaKey = schemaKeys[schIdx];
		let schObj = appConfig.schemas[schemaKey];
		let connectionKey = schObj.connection
		let cnxCfg = appConfig.connections[connectionKey];
		
		let {user, password, connectString} = cnxCfg;
		let cnx = await oracledb.getConnection({user, password, connectString})
		let reverseMap = new ReverseMap(cnx);
		let lstObjects = await reverseMap.discover(schemaKey, schObj);
		
		//Remap Schema
		let remapSchema = {};
		Object.keys(appConfig.schemas)
		.filter((schemaKey)=> {return appConfig.schemas[schemaKey].connection == connectionKey})
		.forEach((schemaKey)=>{remapSchema[schemaKey] = appConfig.schemas[schemaKey].remap})
		
		let forwardMap = new ForwardMap(cnx, remapSchema);
		let res = await forwardMap.forward(lstObjects, appConfig.basePath);
		await cnx.close();
	}
	return 0;
}
async function main()
{
	let args = parser.parseArgs();
	let appConfig = loadConfig(args);

	if(args.subcommand == "config")
	{
		appConfig.save();
	}
	else if(args.subcommand == "exportsql")
	{
		await exportsql(appConfig);
	}
	else throw new Error(`args.subcommand "${args.subcommand}" not implemented`)
};

main()
.then((p)=>
{
	process.exit(0);
})
.catch((e)=>
{
	console.error("error", e);
	process.exit(1)
});