const EventEmitter = require('events');
const ProgressBar = require('progress');
const colors =
{
	Reset : "\x1b[0m"      ,
	Bright : "\x1b[1m"     ,
	Dim : "\x1b[2m"        ,
	Underscore : "\x1b[4m" ,
	Blink : "\x1b[5m"      ,
	Reverse : "\x1b[7m"    ,
	Hidden : "\x1b[8m"     ,
	FgBlack : "\x1b[30m"   ,
	FgRed : "\x1b[31m"     ,
	FgGreen : "\x1b[32m"   ,
	FgYellow : "\x1b[33m"  ,
	FgBlue : "\x1b[34m"    ,
	FgMagenta : "\x1b[35m" ,
	FgCyan : "\x1b[36m"    ,
	FgWhite : "\x1b[37m"   ,
	BgBlack : "\x1b[40m"   ,
	BgRed : "\x1b[41m"     ,
	BgGreen : "\x1b[42m"   ,
	BgYellow : "\x1b[43m"  ,
	BgBlue : "\x1b[44m"    ,
	BgMagenta : "\x1b[45m" ,
	BgCyan : "\x1b[46m"    ,
	BgWhite : "\x1b[47m"   ,
};

function Program()
{
	this.exec = function exec(files)
	{
		class MyEmitter extends EventEmitter {}
		const myEmitter = new MyEmitter();
		
		myEmitter.emit('init', {length: files.length});
		let promises = files.map((file)=>
		{
			genfile(file)
			.then((obj)=>
			{
				myEmitter.emit('data', obj);
			});
		})
		Promise.all(promises)
		.then((obj)=>
		{
			myEmitter.emit('end');
		})
		.catch((e)=>
		{
				myEmitter.emit('error');
		})
		return myEmitter;
	}
	
	function genfile(obj)
	{
		return new Promise((resolve, reject)=>
		{
			setTimeout(
			function()
			{
				return resolve(obj)
			}, 300);
			
		})
	}
}

async function Main()
{
	let files = 
	[
		{filename: "./default/01_Sequences/SQ_PEDIDO.sql"},
		{filename: "./default/01_Sequences/SQ_PRODUTO.sql"},
		{filename: "./default/01_Sequences/SQ_USUARIO.sql"},
		{filename: "./default/02_Tabelas/ADM_FUNCIONAL.sql"},
		{filename: "./default/02_Tabelas/ADM_OPERACAO.sql"},
		{filename: "./default/02_Tabelas/ADM_OPERACAO_FUNCIONAL.sql"},
		{filename: "./default/02_Tabelas/ADM_USUARIO.sql"},
		{filename: "./default/02_Tabelas/ADM_USUARIO_FUNCIONAL.sql"},
		{filename: "./default/02_Tabelas/CRM_CLIENTE.sql"},
		{filename: "./default/02_Tabelas/CRM_CLIENTE_ENDERECO.sql"},
		{filename: "./default/02_Tabelas/MW_ADM_USUARIO.sql"},
		{filename: "./default/02_Tabelas/SLS_ITEM_PEDIDO.sql"},
		{filename: "./default/02_Tabelas/SLS_PEDIDO.sql"},
		{filename: "./default/02_Tabelas/SLS_PRODUTO.sql"},
		{filename: "./default/02_Tabelas/WEB_APLICACAO.sql"},
		{filename: "./default/02_Tabelas/WEB_ATRIBUTO.sql"},
		{filename: "./default/02_Tabelas/WEB_ESQUEMA.sql"},
		{filename: "./default/02_Tabelas/WEB_FORMATO_DADO.sql"},
		{filename: "./default/02_Tabelas/WEB_OPCAO.sql"},
		{filename: "./default/02_Tabelas/WEB_PARAMETRO.sql"},
		{filename: "./default/02_Tabelas/WEB_PONTOFINAL.sql"},
		{filename: "./default/02_Tabelas/WEB_RETORNO.sql"},
		{filename: "./default/02_Tabelas/WEB_STATUS_RETORNO.sql"},
		{filename: "./default/02_Tabelas/WEB_TIPO_DADO.sql"},
		{filename: "./default/06_Views/VW_ADM_USUARIO.sql"},
		{filename: "./default/07_Materialized_Views/MW_ADM_USUARIO.sql"},
		{filename: "./default/08_Types/OBJ_CONS.tpb"},
		{filename: "./default/08_Types/OBJ_CONS.tps"},
		{filename: "./default/08_Types/PERSON_T.tps"},
		{filename: "./default/09_Programaveis/FUNCTION1.fnc"},
		{filename: "./default/09_Programaveis/PKG_EXCEL.pkb"},
		{filename: "./default/09_Programaveis/PKG_EXCEL.pks"},
		{filename: "./default/09_Programaveis/PROCEDURE1.prc"},
	];
	
	let program = new Program();
	var bar = new ProgressBar(`generating [${colors.FgGreen}:bar${colors.Reset}]  :percent - :filename`, 
	{ 
		complete: '#',
		incomplete: '.', 
		width: 15,
		total: files.length 
	});
	
	let exec = program.exec(files);
	exec.on("init", (data)=>
	{
		
	});
	exec.on("data", (data)=>
	{
		bar.tick(data);
	});
	
}

Main()
.then((o)=>{console.log("sucess", o)})
.catch((e)=>{console.error("error",e)})

