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
			"owner": "aob.owner",
			"objectName": "aob.object_name",
			"subobjectName": "aob.subobject_name",
			"objectId": "aob.object_id",
			"dataObjectId": "aob.data_object_id",
			"objectType": "aob.object_type",
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
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"objectName": OrclUtil.filterEqual(["objectName"]),
			"objectNameLike": OrclUtil.filterLike(["objectName"]),
			"objectNameNotLike": OrclUtil.filterNotLike(["objectName"]),
			"objectType": OrclUtil.filterEqual(["objectType"])
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