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
			"owner": "avw.owner",
			"viewName": "avw.view_name",
			"textLength": "avw.text_length",
			"text": "avw.text",
			"typeTextLength": "avw.type_text_length",
			"typeText": "avw.type_text",
			"oidTextLength": "avw.oid_text_length",
			"oidText": "avw.oid_text",
			"viewTypeOwner": "avw.view_type_owner",
			"viewType": "avw.view_type",
			"superviewName": "avw.superview_name",
			"editioningView": "avw.editioning_view",
			"readOnly": "avw.read_only",
		},
		sources:
		{
			"avw": "all_views",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"viewName": OrclUtil.filterEqual(["viewName"]),
			"viewNameLike": OrclUtil.filterLike(["viewName"]),
			"viewNameNotLike": OrclUtil.filterNotLike(["viewName"]),
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