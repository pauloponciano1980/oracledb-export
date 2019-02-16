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
			"owner": "atc.OWNER",
			"tableName": "atc.TABLE_NAME",
			"tableType": "atc.TABLE_TYPE",
			"comments": "atc.COMMENTS",
		},
		sources:
		{
			"atc": "all_tab_comments",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"tableName": OrclUtil.filterEqual(["tableName"]),
			"tableType": OrclUtil.filterEqual(["tableType"]),
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