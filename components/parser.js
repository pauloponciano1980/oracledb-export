const {ArgumentParser} = require('argparse');
const package = require("../package.json");
let parser = new ArgumentParser
({
	prog: package.name,
	version: package.version,
	description: package.description,
	addHelp:true,
});
let subparsers = parser.addSubparsers({dest: "subcommand"});
{
	let subparser = subparsers.addParser('config', {addHelp:true});
	subparser.addArgument(['-f', '--file' ], { help: 'Configuration File', dest:"file" , action: 'store', required:true});
	subparser.addArgument(['-n', '--name' ], { help: 'Project Name', dest:"name", action: 'store'});
	subparser.addArgument(['-v', '--version' ], { help: 'Project Version', action: 'store'});
	subparser.addArgument(['-d', '--description' ], { help: 'Project Description', dest: "description",action: 'store'});
	subparser.addArgument(['-c', '--connection' ], { help: 'Connection', action: 'store', nargs:3});
	subparser.addArgument(['-s', '--schema' ], { help: 'Project Name', dest:"schema", action: 'store'});
	subparser.addArgument(['-e', '--remap' ], { help: 'Schema Reverse', dest:"remap", action: 'store'});
	subparser.addArgument(['-l', '--lname' ], { help: 'Schema Forward', dest:"logicalName", action: 'store'});
	subparser.addArgument(['-a', '--add' ],      {  dest:"add", help: 'Adiciona Objeto', nargs:'*', action: 'append'});
	subparser.addArgument(['-r', '--rem' ],      {  dest:"rem", help: 'Remove Objeto',   nargs:'*', action: 'append'});
};
{
	let subparser = subparsers.addParser('exportsql', {addHelp:true});
	subparser.addArgument(['-f',  '--file' ], { help: 'Configuration File', dest:"file" , action: 'store', required:true});
};
module.exports= parser;
