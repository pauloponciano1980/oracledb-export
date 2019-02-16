const C_ORACLEDB_OBJECT = 4002;
module.exports = 
{
	getCountStatement: 
	(findConfig, search) =>
	{
		var daoOptions = { "autoCommit": false, "outFormat": C_ORACLEDB_OBJECT };
		var daoParameters=[];
		var daoWhere = Array.from(findConfig.where);
		// parsing parameters
		if(typeof findConfig.dynamicFilters == "object")
		{
			Object.keys(findConfig.dynamicFilters).forEach((key) =>
			{
				let daoFilter = findConfig.dynamicFilters[key];
				if(typeof daoFilter != 'function') throw new Error('filter "' + key + '" is not a function');
				let value = search[key];
				if(typeof search.q === 'undefined') {}
				else
				{
					daoWhere[daoWhere.length] = daoFilter(value, daoParameters, findConfig.columns);
				}
			})
		}
		let daoStatement = ""
		daoStatement += 'SELECT count(1) "rowCount" '
		daoStatement += "FROM  "
		Object.keys(findConfig.sources).forEach((key,i)=>{
			if (i>0) daoStatement += ", "
			daoStatement += " ";
			daoStatement += findConfig.sources[key];
			daoStatement += " " + '' + key + '' + "";
		})
		if (daoWhere.length > 0)
		{
			daoStatement += " where "
			daoStatement += daoWhere.join(" and ");
		}
		return {statement: daoStatement, parameters : daoParameters, options: daoOptions};
	},
	getFindStatement: 
	(findConfig, search, options) =>
	{
		var daoOptions = { "autoCommit": false, "outFormat": C_ORACLEDB_OBJECT };
		var daoWhere = Array.from(findConfig.where);
		var daoParameters=[];
		
		// parsing parameters
		if(typeof findConfig.dynamicFilters != "object") findConfig.dynamicFilters = {};
		
		Object.keys(search).forEach((key) =>
		{
			if (typeof findConfig.dynamicFilters[key] == "undefined") throw new Error('dynamicFilter "'+key+'" is not defined');
		});
		
		Object.keys(findConfig.dynamicFilters).forEach((key) =>
		{
			let daoFilter = findConfig.dynamicFilters[key];
			if(typeof daoFilter != 'function') throw new Error('filter "' + key + '" is not a function');
			let value = search[key];
			if(typeof value === 'undefined') {}
			else if(Array.isArray(value))
			{
				if(value.length > 0) daoWhere[daoWhere.length] = daoFilter(value, daoParameters, findConfig.columns);
			}
			else
			{
				daoWhere[daoWhere.length] = daoFilter(value, daoParameters, findConfig.columns);
			}
		})
	
		//daoInnerStatement
		let daoInnerStatement = "";
		daoInnerStatement += "SELECT  "
		Object.keys(findConfig.columns).forEach((key,i)=>{
			if (i>0) daoInnerStatement += ", "
			daoInnerStatement += findConfig.columns[key];
			daoInnerStatement += " as " + '"' + key + '"' + "";
		})
		daoInnerStatement += " ";
		daoInnerStatement += "FROM  "
		Object.keys(findConfig.sources).forEach((key,i)=>{
			if (i>0) daoInnerStatement += ", ";
			daoInnerStatement += findConfig.sources[key] +  " " + key + " ";
		})
		if (daoWhere.length > 0)
		{
			daoInnerStatement += " where "
			daoInnerStatement += daoWhere.join(" and ");
		}
		
		if(typeof options == "undefined") options = {};
		if(typeof options.sortBy == "string") 
		{
			if (typeof options.sort== "undefined") options.sort = "asc";
			daoInnerStatement += "order by " + findConfig.columns[options.sortBy] + " " + options.sort + " ";
		}
		//end daoInnerStatement
		
		
		if(typeof options.limit == "undefined")
		{
			
			daoStatement = daoInnerStatement;
		}
		else
		{
			if (typeof options.offset== "undefined") options.offset = 0;
			let daoStatement = ""
			daoStatement += "SELECT "
			Object.keys(findConfig.columns).forEach((key,i)=>{
				if (i>0) daoStatement += ", "
				daoStatement += '"' + key + '" '
			})
			daoStatement += "FROM "
			daoStatement += "( "
			daoStatement += "select rownum rnum, src.* from ( "
			daoStatement += daoInnerStatement;
			
			daoStatement += ") src";
			daoStatement += " ";
			
			let iParOffset = daoParameters.length;
			daoParameters[iParOffset] = options.offset;
			let iParLimit = daoParameters.length;
			daoParameters[iParLimit] = options.limit;
			daoStatement += "WHERE rownum < (:" + (iParOffset+1) + " + :" + (iParLimit+1) + " + 1) "
			daoStatement += ") "
			daoStatement += "WHERE (rnum > :" + (iParOffset+1) + ") ";
			
		}
		return {statement: daoStatement, parameters : daoParameters, options: daoOptions};
	},
	
	filterLike:
	(arrField)=>
	{
		return(values, daoParameters, daoColumns)=>
		{
			if(typeof values === 'string')
			{
				values = [values];
			}
			if(Array.isArray(values))
			{
				let where = "("
				values.forEach((value, iValue)=>
				{
					if(typeof value !== 'string') throw new Error('invalid data type ["' + (typeof value) + '"] for "filterLike".')
					arrField.forEach((field, iField)=>
					{
						let iParameter = daoParameters.length;
						daoParameters[iParameter] = value;
						let expr = daoColumns[field];
						where += ((iField + iValue == 0)?"":"or ")
						where += "(upper(" + expr + ") like upper(:" + (iParameter+1).toString() + ")) "
					})
				});
				where += ")";
				return where;
			}
			else {throw new Error('invalid data type "' + (typeof values) + '" for "' + 'q' + '".')}
		}
	},
	
	filterNotLike:
	(arrField)=>
	{
		return(values, daoParameters, daoColumns)=>
		{
			if(typeof values === 'string')
			{
				values = [values];
			}
			if(Array.isArray(values))
			{
				let where = "("
				values.forEach((value, iValue)=>
				{
					if(typeof value !== 'string') throw new Error('invalid data type ["' + (typeof value) + '"] for "filterLike".')
					arrField.forEach((field, iField)=>
					{
						let iParameter = daoParameters.length;
						daoParameters[iParameter] = value;
						let expr = daoColumns[field];
						where += ((iField + iValue == 0)?"":"and ")
						where += "(upper(" + expr + ") not like upper(:" + (iParameter+1).toString() + ")) "
					})
				});
				where += ")";
				return where;
			}
			else {throw new Error('invalid data type "' + (typeof values) + '" for "' + 'q' + '".')}
		}
	},
	
	filterEqual:
	(arrField)=>
	{
		
		return(values, daoParameters, daoColumns)=>
		{
			
			if(typeof values === 'string')
			{
				values = [values];
			}
			if(Array.isArray(values))
			{
				let where = "("
				values.forEach((value, iValue)=>
				{
					arrField.forEach((field, iField)=>
					{
						let iParameter = daoParameters.length;
						daoParameters[iParameter] = value;
						let expr = daoColumns[field];
						where += ((iField + iValue == 0)?"":"or ")
						where += "(" + expr + " = :" + (iParameter+1).toString() + ") "
					})
				});
				where += ")";
				return where;
			}
			else {throw new Error('invalid data type "' + (typeof values) + '" for "' + 'q' + '".')}
		}
	}
};