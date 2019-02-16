"use strict"
const DbmsMetadataDao = require("../dao/DbmsMetadataDao.js");

function MetadataService(connection)
{
	this._connection = connection;	
	

	this.getData = async function getData(obj, remapSchema)
	{
		return "CREATE DATA "+ obj.owner + "." + obj.name+"";
	};	
	this.getSequenceDDL =  async function getSequenceDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "SEQUENCE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getIndexDDL =  async function getIndexDDL(obj, remapSchema)
	{
		return "CREATE INDEX "+ obj.owner + "." + obj.name+"";
	};
	this.getForeignKeyDDL =  async function getForeignKeyDDL(obj, remapSchema)
	{
		return "CREATE FOREIGNKEY "+ obj.owner + "." + obj.name+"";
	};
	this.getViewDDL =  async function getViewDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "VIEW",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"FORCE": false
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getMviewDDL =  async function getData(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "MATERIALIZED_VIEW",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	
	this.getProcedureDDL =  async function getProcedureDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "PROCEDURE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getFunctionDDL =  async function getFunctionDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "FUNCTION",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getTypeSpecDDL =  async function getTypeSpecDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "TYPE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"BODY": false,
			"OID": false,
			"SPECIFICATION": true,
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getTypeBodyDDL =  async function getTypeBodyDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "TYPE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"BODY": true,
			"OID": false,
			"SPECIFICATION": false,
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getPackageSpecDDL = async function getPackageSpecDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "PACKAGE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"BODY": false,
			"SPECIFICATION": true,
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getPackageBodyDDL =  async function getPackageBodyDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "PACKAGE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"BODY": true,
			"SPECIFICATION": false,
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getTriggerDDL =  async function getTriggerDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "TRIGGER",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getSynonymDDL =  async function getSynonymDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "SYNONYM",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
	this.getTableDDL = async function getTableDDL(obj, remapSchema)
	{
		let dbmsMetadataDao = new DbmsMetadataDao(this._connection);
		const params = 
		{
			"NAME": obj.name,
			"OWNER": obj.owner,
			"OBJECT_TYPE": "TABLE",
			"VERSION": "COMPATIBLE",
			"MODEL": "ORACLE", 
			"NETWORK_LINK": "",
			"SQLTERMINATOR": true,
			"SEGMENT_ATTRIBUTES": false,
			"SIZE_BYTE_KEYWORD": true,
			"CONSTRAINTS_AS_ALTER": true
		};
		let ddl = await dbmsMetadataDao.getDDL(params, remapSchema);
		return ddl;
	};
};
module.exports = MetadataService;