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
			"owner": "asq.sequence_owner",
			"name" : "asq.sequence_name",
			"minValue" : "asq.min_value",
			"maxValue" : "asq.max_value",
			"incrementBy" : "asq.increment_by",
			"cycleFlag" : "asq.cycle_flag",
			"orderFlag" : "asq.order_flag",
			"cacheSize" : "asq.cache_size",
			"lastNumber" : "asq.last_number",
		},
		sources:
		{
			"asq": "all_sequences",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
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