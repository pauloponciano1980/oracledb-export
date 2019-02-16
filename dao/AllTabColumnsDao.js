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
			"columnId":          "atc.column_id", 	
			"owner":             "atc.owner", 	
			"tableName":         "atc.table_name", 	
			"columnName":        "atc.column_name", 	
			"dataType":          "atc.data_type", 	
			//"dataTypeMod":       "atc.data_type_mod", 	
			//"dataTypeOwner":     "atc.data_type_owner", 	
			"dataLength":        "atc.data_length", 	
			"dataPrecision":     "atc.data_precision", 	
			"dataScale":         "atc.data_scale", 	
			"nullable":          "atc.nullable", 	
			
			//"defaultLength":     "atc.default_length", 	
			"dataDefault":       "atc.data_default", 	
			//"numDistinct":       "atc.num_distinct", 	
			//"lowValue":          "atc.low_value", 	
			//"highValue":         "atc.high_value", 	
			//"density":           "atc.density", 	
			//"numNulls":          "atc.num_nulls", 	
			//"numBuckets":        "atc.num_buckets", 	
			//"lastAnalyzed":      "atc.last_analyzed", 	
			//"sampleSize":        "atc.sample_size", 	
			//"characterSetName":  "atc.character_set_name", 	
			//"charColDeclLength": "atc.char_col_decl_length", 	
			//"globalStats":       "atc.global_stats", 	
			//"userStats":         "atc.user_stats", 	
			//"avgColLen":         "atc.avg_col_len", 	
			"charLength":        "atc.char_length", 	
			"charUsed":          "atc.char_used", 	
			//"v80FmtImage":       "atc.v80_fmt_image", 	
			//"dataUpgraded":      "atc.data_upgraded", 	
			//"histogram":         "atc.histogram",
		},
		sources:
		{
			"atc": "all_tab_columns",
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
};