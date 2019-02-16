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
			"owner": "act.owner",
			"constraintName": "act.constraint_name",
			"constraintType": "act.constraint_type",
			"tableName": "act.table_name",
			"searchCondition": "act.search_condition",
			"rOwner": "act.r_owner",
			"rConstraintName": "act.r_constraint_name",
			"deleteRule": "act.delete_rule",
			"status": "act.status",
			"deferrable": "act.deferrable",
			"deferred": "act.deferred",
			"validated": "act.validated",
			"generated": "act.generated",
			"bad": "act.bad",
			"rely": "act.rely",
			"lastChange": "act.last_change",
			"indexOwner": "act.index_owner",
			"indexName": "act.index_name",
			"invalid": "act.invalid",
			"viewRelated": "act.view_related",
		},
		sources:
		{
			"act": "all_constraints"
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"constraintName": OrclUtil.filterEqual(["constraintName"]),
			"constraintType": OrclUtil.filterEqual(["constraintType"]),
			"constraintNameLike": OrclUtil.filterLike(["constraintName"]),
			"constraintNameNotLike": OrclUtil.filterNotLike(["constraintName"]),
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