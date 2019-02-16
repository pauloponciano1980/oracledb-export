"use strict";
const oracledb = require("oracledb");
var OrclUtil = require("../components/OrclUtil");

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
			"owner": "acc.OWNER",
			"tableName": "acc.TABLE_NAME",
			"columnName": "acc.COLUMN_NAME",
			"comments": "acc.COMMENTS",
		},
		sources:
		{
			"acc": "all_col_comments",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"tableName": OrclUtil.filterEqual(["tableName"]),
			"columnName": OrclUtil.filterEqual(["columnName"]),
		}
	};

	this.find = async(search) =>
	{
		var  {statement, parameters, options} = OrclUtil.getFindStatement(this._findConfig, search)
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
		var  {statement, parameters, options} = OrclUtil.getCountStatement(this._findConfig, search)
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