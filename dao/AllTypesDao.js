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
			"owner": "aty.owner",
			"typeName": "aty.type_name",
			"typeOid": "aty.type_oid",
			"typecode": "aty.typecode",
			"attributes": "aty.attributes",
			"methods": "aty.methods",
			"predefined": "aty.predefined",
			"incomplete": "aty.incomplete",
			"final": "aty.final",
			"instantiable": "aty.instantiable",
			"supertypeOwner": "aty.supertype_owner",
			"supertypeName": "aty.supertype_name",
			"localAttributes": "aty.local_attributes",
			"localMethods": "aty.local_methods",
			"typeid": "aty.typeid",
		},
		sources:
		{
			"aty": "all_types",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"typeName": OrclUtil.filterEqual(["typeName"]),
			"typeNameLike": OrclUtil.filterLike(["typeName"]),
			"typeNameNotLike": OrclUtil.filterNotLike(["typeName"]),
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