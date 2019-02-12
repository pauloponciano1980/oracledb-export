const oracledb = require("oracledb");
var OrclUtil = require("./OrclUtil");

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
			"owner": "asy.owner",
			"synonymName": "asy.synonym_name",
			"tableOwner": "asy.table_owner",
			"tableName": "asy.table_name",
			"dbLink": "asy.db_link",
		},
		sources:
		{
			"asy": "all_synonyms"
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"synonymName": OrclUtil.filterEqual(["synonymName"]),
			"synonymNameLike": OrclUtil.filterLike(["synonymName"]),
			"synonymNameNotLike": OrclUtil.filterNotLike(["synonymName"]),
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