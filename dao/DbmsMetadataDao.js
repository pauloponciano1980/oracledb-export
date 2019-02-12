 const oracledb = require("oracledb");
 function DbmsMetadataDao(connection)
{

	this._connection = connection;
	this.getDDL = async function getDDL(params, remapSchema)
	{
		let daoParameters = 
		{
			//FILTERS
			"NAME":               {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val:undefined},
			"OWNER":              {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val:undefined},
			//OPEN
			"OBJECT_TYPE":        {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val:undefined},
			"VERSION":        {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val:'COMPATIBLE'},
			"MODEL":        {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val:'ORACLE'}, 
			"NETWORK_LINK":        {"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val: undefined},
			//TRANSFORMS
			"DEFAULT": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val:undefined },
			"BODY": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: undefined },
			"CONSTRAINTS": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1 },
			"CONSTRAINTS_AS_ALTER": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 0},
			"FORCE": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: undefined },
			"OID": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: undefined },
			"PARTITIONING": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1 },
			//"PCTSPACE": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: undefined },
			"PRETTY": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1},
			"REF_CONSTRAINTS": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val:1 },
			//"REUSE": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 0},
			"REVOKE_FROM":	{"type": oracledb.STRING,  "dir": oracledb.BIND_IN, val: undefined },
			"SIZE_BYTE_KEYWORD": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 0},
			"SQLTERMINATOR":      {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 0},
			"STORAGE": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1},
			"TABLESPACE": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1 },
			"SEGMENT_ATTRIBUTES": {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: 1},
			"SPECIFICATION":     {"type": oracledb.NUMBER,  "dir": oracledb.BIND_IN, val: undefined},

			//OUTPUT
			"DDL": {"type": oracledb.CLOB,    "dir": oracledb.BIND_OUT},
		};

		Object.keys(params).forEach((key)=>{
			if(typeof daoParameters[key] ==="undefined" ) throw new Error('Parametro "'+key+'" não existe em ' + Object.keys(daoParameters) + '')
			if(typeof params[key] == "boolean" && daoParameters[key].type == oracledb.NUMBER){daoParameters[key].val = params[key]?1:0;}
			else{daoParameters[key].val = params[key];}
		})

		let daoStatement = "";
		daoStatement += "declare \r\n";
		daoStatement += "ddl_handle number; \r\n";
		daoStatement += "modify_handle number; \r\n";
		daoStatement += "h number; \r\n";
		daoStatement += "begin \r\n";
		daoStatement += "h := DBMS_METADATA.OPEN(:OBJECT_TYPE, :VERSION, :MODEL, :NETWORK_LINK); \r\n";
		daoStatement += "modify_handle := DBMS_METADATA.ADD_TRANSFORM(h, 'MODIFY'); \r\n";
		daoStatement += "ddl_handle := DBMS_METADATA.ADD_TRANSFORM(h, 'DDL'); \r\n";
		daoStatement += "DBMS_METADATA.SET_REMAP_PARAM(modify_handle,'REMAP_SCHEMA','MYNODEAPP','CUPCAKE'); \r\n";
		daoStatement += "dbms_metadata.set_filter(h, 'SCHEMA', :OWNER); \r\n";
		daoStatement += "DBMS_METADATA.SET_FILTER(h, 'NAME', :NAME); \r\n";

		delete params["NAME"];            
		delete params["OWNER"];
		delete params["OBJECT_TYPE"];  
		delete params["VERSION"];     
		delete params["MODEL"];    
		delete params["NETWORK_LINK"];  

		if(typeof params["DEFAULT"]==="undefined") delete daoParameters["DEFAULT"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'DEFAULT',case :DEFAULT when 1 then true when 0 then false end); \r\n";
		if(typeof params["BODY"]==="undefined") delete daoParameters["BODY"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'BODY',case :BODY when 1 then true when 0 then false end); \r\n";
		if(typeof params["CONSTRAINTS"]==="undefined") delete daoParameters["CONSTRAINTS"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'CONSTRAINTS',case :CONSTRAINTS when 1 then true when 0 then false end); \r\n";
		if(typeof params["CONSTRAINTS_AS_ALTER"]==="undefined") delete daoParameters["CONSTRAINTS_AS_ALTER"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'CONSTRAINTS_AS_ALTER',case :CONSTRAINTS_AS_ALTER when 1 then true when 0 then false end); \r\n";
		if(typeof params["FORCE"]==="undefined") delete daoParameters["FORCE"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'FORCE',case :FORCE when 1 then true when 0 then false end); \r\n";
		if(typeof params["OID"]==="undefined") delete daoParameters["OID"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'OID',case :OID when 1 then true when 0 then false end); \r\n";
		if(typeof params["PARTITIONING"]==="undefined") delete daoParameters["PARTITIONING"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'PARTITIONING',case :PARTITIONING when 1 then true when 0 then false end); \r\n";
		//daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'PCTSPACE',case :PCTSPACE when 1 then true when 0 then false end); \r\n";
		daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'PRETTY',case :PRETTY when 1 then true when 0 then false end); \r\n";
		if(typeof params["REF_CONSTRAINTS"]==="undefined") delete daoParameters["REF_CONSTRAINTS"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'REF_CONSTRAINTS',case :REF_CONSTRAINTS when 1 then true when 0 then false end); \r\n";
		//daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'REUSE',case :REUSE when 1 then true when 0 then false end); \r\n";
		if(typeof params["REVOKE_FROM"]==="undefined") delete daoParameters["REVOKE_FROM"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'REVOKE_FROM',case :REVOKE_FROM when 1 then true when 0 then false end); \r\n";
		if(typeof params["SIZE_BYTE_KEYWORD"]==="undefined") delete daoParameters["SIZE_BYTE_KEYWORD"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'SIZE_BYTE_KEYWORD',case :SIZE_BYTE_KEYWORD when 1 then true when 0 then false end); \r\n";
		daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'SQLTERMINATOR',case :SQLTERMINATOR when 1 then true when 0 then false end); \r\n";
		if(typeof params["STORAGE"]==="undefined") delete daoParameters["STORAGE"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'STORAGE',case :STORAGE when 1 then true when 0 then false end); \r\n";
		if(typeof params["TABLESPACE"]==="undefined") delete daoParameters["TABLESPACE"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'TABLESPACE',case :TABLESPACE when 1 then true when 0 then false end); \r\n";
		if(typeof params["SEGMENT_ATTRIBUTES"]==="undefined") delete daoParameters["SEGMENT_ATTRIBUTES"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'SEGMENT_ATTRIBUTES', case :SEGMENT_ATTRIBUTES when 1 then true when 0 then  false end); \r\n";
		if(typeof params["SPECIFICATION"]==="undefined") delete daoParameters["SPECIFICATION"]; else daoStatement += "dbms_metadata.set_transform_param(ddl_handle,'SPECIFICATION', case :SPECIFICATION when 1 then true when 0 then  false end); \r\n";

		daoStatement += ":DDL :=  DBMS_METADATA.fetch_clob(h); \r\n";
		daoStatement += "end; \r\n";

		let daoOptions = {};

		try
		{
			let res = await this._connection.execute(daoStatement, daoParameters, daoOptions);
			return await readBuffer(res.outBinds.DDL)
		}
		catch(e)
		{
			e.statement = daoStatement;
			e.parameters = daoParameters;
			e.options = daoOptions;
			throw (e);
		}
	}

	function readBuffer(buffer)
	{
		//if( buffer ===null) return null;
		return new Promise((resolve, reject)=>
		{
			let mydata =""

			buffer.setEncoding('utf8'); 
			buffer.on("data", function (chunk) 
			{

				mydata += chunk
			});

			buffer.on("error", function (e) 
			{

				return reject(e);
			});

			buffer.on("end", function () 
			{

				return resolve(mydata)
			});

		})
	}
};
module.exports = DbmsMetadataDao