import commandLineArgs from 'command-line-args';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const options = commandLineArgs([
	{
		name:'api-url',
		type:String
	},
	{
		name:'port',
		type:Number
	}
],{
	argv:process.argv.slice(2),
	camelCase:true,
	partial:true
});

if(undefined !== options.port
&& (!Number.isInteger(options.port)
|| 0 >= options.port || 65535 < options.port)){
	throw new Error('--port must be an integer from 1 to 65535');
}

const npmExecPath = process.env.npm_execpath;
if(undefined === npmExecPath || '' === npmExecPath){
	throw new Error('Run this command with npm run dev:gui.');
}

const projectRoot = fileURLToPath(new URL('../',import.meta.url));
const environment = {...process.env};
if(undefined !== options.apiUrl){
	environment.PETQUERY_DEV_GUI_API_URL = options.apiUrl;
}

let activeChild = null;
let receivedSignal = null;

function signalExitCode(signal){
	if('SIGINT' === signal){
		return 130;
	}
	if('SIGTERM' === signal){
		return 143;
	}
	return 1;
}

function onSignal(signal){
	receivedSignal = signal;
	process.exitCode = signalExitCode(signal);
	if(null !== activeChild){
		activeChild.kill(signal);
	}
}

process.once('SIGINT',()=>{
	onSignal('SIGINT');
});
process.once('SIGTERM',()=>{
	onSignal('SIGTERM');
});

function runNpm(args){
	if(null !== receivedSignal){
		process.exitCode = signalExitCode(receivedSignal);
		return Promise.resolve(false);
	}
	return new Promise((resolvePromise,reject)=>{
		const child = spawn(process.execPath,[
			npmExecPath,
			...args
		],{
			cwd:projectRoot,
			env:environment,
			stdio:'inherit'
		});
		activeChild = child;
		child.once('error',(error)=>{
			if(activeChild === child){
				activeChild = null;
			}
			reject(error);
		});
		child.once('exit',(code,signal)=>{
			if(activeChild === child){
				activeChild = null;
			}
			if(null !== receivedSignal){
				process.exitCode = signalExitCode(receivedSignal);
				resolvePromise(false);
				return;
			}
			if(0 === code){
				resolvePromise(true);
				return;
			}
			if(null !== signal){
				process.exitCode = signalExitCode(signal);
				resolvePromise(false);
				return;
			}
			if(130 === code || 143 === code){
				process.exitCode = code;
				resolvePromise(false);
				return;
			}
			reject(new Error(
				`npm ${args.join(' ')} exited with code ${code}`
			));
		});
	});
}

async function main(){
	const docsCompleted = await runNpm(['run','doc']);
	if(!docsCompleted){
		return;
	}

	const viteArguments = [];
	if(undefined !== options.port){
		viteArguments.push('--port',String(options.port));
	}
	viteArguments.push(...(options._unknown ?? []));

	const guiArguments = ['--prefix','gui','run','dev'];
	if(0 < viteArguments.length){
		guiArguments.push('--',...viteArguments);
	}
	await runNpm(guiArguments);
}

await main();
