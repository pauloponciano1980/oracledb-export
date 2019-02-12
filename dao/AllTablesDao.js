//		daoStatement += 'select\r\n';
//		daoStatement += 'owner "owner",\r\n';
//		daoStatement += 'table_name "tableName"\r\n';
//		daoStatement += 'from\r\n';
//		daoStatement += 'all_tables\r\n';

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
			"owner": "atb.owner",
			"tableName" : "atb.table_name",
		},
		sources:
		{
			"atb": "all_tables",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"tableName": OrclUtil.filterEqual(["tableName"]),
			"tableNameLike": OrclUtil.filterLike(["tableName"]),
			"tableNameNotLike": OrclUtil.filterNotLike(["tableName"])
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