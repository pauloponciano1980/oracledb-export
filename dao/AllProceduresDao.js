"use strict";
const oracledb = require("oracledb");
const OrclUtil = require("../components/OrclUtil");

module.exports =
function(connection)
{
	this._connection = connection;
	this._create = undefined;
	this._delete = undefined;

	// FIND
	this._findConfig =
	{
		columns:
		{
			"owner": "aob.owner",
			"name": "aob.object_name",
			"subobjectName": "aob.subobject_name",
			"objectId": "aob.object_id",
			"dataObjectId": "aob.data_object_id",
			"created": "aob.created",
			"lastDdlTime": "aob.last_ddl_time",
			"timestamp": "aob.timestamp",
			"status": "aob.status",
			"temporary": "aob.temporary",
			"generated": "aob.generated",
			"secondary": "aob.secondary",
			"namespace": "aob.namespace",
			"editionName": "aob.edition_name",
		},
		sources:
		{
			"aob": "ALL_OBJECTS",
		},
		where: ["aob.object_type = 'PROCEDURE'"],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"name": OrclUtil.filterEqual(["name"]),
			"nameLike": OrclUtil.filterLike(["name"]),
			"nameNotLike": OrclUtil.filterNotLike(["name"])
		}
	};

	this.find = async(search) =>
	{
		var {statement, parameters, options} = OrclUtil.getFindStatement(this._findConfig, search)
		try
		{
			var result = await this._connection.execute(statement, parameters, options);
			//console.log({statement, parameters, options});
			return (result.rows);
		}
		catch(e)
		{
			e.statement = statement;
			e.parameters = parameters;
			e.options = options;
			throw e;
		}
	};

	this.count = async(search) =>
	{
		var {statement, parameters, options} = OrclUtil.getCountStatement(this._findConfig, search)
		try
		{
			var result = await this._connection.execute(statement, parameters, options);
			return (result.rows[0].rowCount);
		}
		catch(e)
		{
			e.statement = statement;
			e.parameters = parameters;
			e.options = options;
			throw e;
		}
	};

	this.create = undefined;

	this.delete = undefined;
};