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
			"owner": "amw.owner",
			"mviewName": "amw.mview_name",
			"containerName": "amw.container_name",
			"query": "amw.query",
			"queryLen": "amw.query_len",
			"updatable": "amw.updatable",
			"updateLog": "amw.update_log",
			"masterRollbackSeg": "amw.master_rollback_seg",
			"masterLink": "amw.master_link",
			"rewriteEnabled": "amw.rewrite_enabled",
			"rewriteCapability": "amw.rewrite_capability",
			"refreshMode": "amw.refresh_mode",
			"refreshMethod": "amw.refresh_method",
			"buildMode": "amw.build_mode",
			"fastRefreshable": "amw.fast_refreshable",
			"lastRefreshType": "amw.last_refresh_type",
			"lastRefreshDate": "amw.last_refresh_date",
			"staleness": "amw.staleness",
			"afterFastRefresh": "amw.after_fast_refresh",
			"unknownPrebuilt": "amw.unknown_prebuilt",
			"unknownPlsqlFunc": "amw.unknown_plsql_func",
			"unknownExternalTable": "amw.unknown_external_table",
			"unknownConsiderFresh": "amw.unknown_consider_fresh",
			"unknownImport": "amw.unknown_import",
			"unknownTrustedFd": "amw.unknown_trusted_fd",
			"compileState": "amw.compile_state",
			"useNoIndex": "amw.use_no_index",
			"staleSince": "amw.stale_since",
			"numPctTables": "amw.num_pct_tables",
			"numFreshPctRegions": "amw.num_fresh_pct_regions",
			"numStalePctRegions": "amw.num_stale_pct_regions",
		},
		sources:
		{
			"amw": "all_mviews",
		},
		where: [],
		dynamicFilters:
		{
			"owner": OrclUtil.filterEqual(["owner"]),
			"mviewName": OrclUtil.filterEqual(["mviewName"]),
			"mviewNameLike": OrclUtil.filterLike(["mviewName"]),
			"mviewNameNotLike": OrclUtil.filterNotLike(["mviewName"]),
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