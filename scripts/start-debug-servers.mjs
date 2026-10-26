import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

const servers = [
	{
		name:'server-a',
		config:'config/debug/server-a.json',
		endpoint:'http://127.0.0.1:50101',
		tokenEnv:'PETQUERY_DEBUG_SERVER_A_TOKEN'
	},
	{
		name:'server-b',
		config:'config/debug/server-b.json',
		endpoint:'http://127.0.0.1:50102',
		tokenEnv:'PETQUERY_DEBUG_SERVER_B_TOKEN'
	},
	{
		name:'server-c',
		config:'config/debug/server-c.json',
		endpoint:'http://127.0.0.1:50103',
		tokenEnv:'PETQUERY_DEBUG_SERVER_C_TOKEN'
	}
];

const children = [];
const tokens = new Map();
let stopping = false;

async function assertPortFree(port){
	const server = createServer();
	await new Promise((resolveListen,reject)=>{
		server.once('error',reject);
		server.listen(port,'127.0.0.1',()=>{
			server.close((error)=>{
				if(undefined !== error){
					reject(error);
					return;
				}
				resolveListen();
			});
		});
	});
}

async function getToken(server){
	const path = resolve('var/debug',server.name,'bearer-token');
	await mkdir(dirname(path),{recursive:true,mode:0o700});
	try{
		const token = (await readFile(path,'utf8')).trim();
		if(!/^[0-9a-f]{64}$/.test(token)){
			throw new Error(`Invalid saved bearer token for ${server.name}`);
		}
		return token;
	}
	catch(error){
		if('object' !== typeof error || null === error
		|| !('code' in error) || 'ENOENT' !== error.code){
			throw error;
		}
	}
	const token = randomBytes(32).toString('hex');
	await writeFile(path,`${token}\n`,{flag:'wx',mode:0o600});
	return token;
}

async function startServer(server){
	const token = await getToken(server);
	tokens.set(server.name,token);
	const child = spawn(process.execPath,[
		resolve('dist/index.js'),
		'--config',
		resolve(server.config)
	],{
		cwd:process.cwd(),
		env:{
			...process.env,
			[server.tokenEnv]:token
		},
		stdio:'inherit'
	});
	children.push({server,child});
}

async function getJson(url,options = {}){
	const response = await fetch(url,{
		...options,
		signal:AbortSignal.timeout(2000)
	});
	const value = await response.json();
	if(!response.ok){
		throw new Error(`HTTP ${response.status} for ${url}`);
	}
	return value;
}

async function waitForServer(server){
	let lastError;
	for(let attempt = 0; attempt < 60; attempt++){
		try{
			const envelope = await getJson(
				`${server.endpoint}/api/ping/get`
			);
			if(true !== envelope.success
			|| 'string' !== typeof envelope.data?.gid){
				throw new Error(`Invalid ping response from ${server.name}`);
			}
			return envelope.data.gid;
		}
		catch(error){
			lastError = error;
			await delay(500);
		}
	}
	throw new Error(`Timed out waiting for ${server.name}`,{
		cause:lastError
	});
}

async function registerPeer(target,peer){
	const token = tokens.get(target.name);
	if(undefined === token){
		throw new Error(`Missing token for ${target.name}`);
	}
	const path = `${target.endpoint}/api/server/put/`
		+encodeURIComponent(peer.gid);
	const envelope = await getJson(path,{
		method:'PUT',
		headers:{
			authorization:`Bearer ${token}`,
			'content-type':'application/json'
		},
		body:JSON.stringify({uri:peer.endpoint})
	});
	if(true !== envelope.success){
		throw new Error(
			`Could not register ${peer.name} with ${target.name}`
		);
	}
}

function waitForSignal(){
	return new Promise((resolveSignal)=>{
		process.once('SIGINT',()=>{
			resolveSignal('SIGINT');
		});
		process.once('SIGTERM',()=>{
			resolveSignal('SIGTERM');
		});
	});
}

function watchChildExits(){
	return Promise.race(children.map(({server,child})=>{
		return new Promise((resolveExit)=>{
			child.once('error',(error)=>{
				resolveExit({server,error});
			});
			child.once('exit',(code,signal)=>{
				resolveExit({server,code,signal});
			});
		});
	}));
}

async function closeChildren(){
	stopping = true;
	for(const {child} of children){
		if(null === child.exitCode && null === child.signalCode){
			child.kill('SIGTERM');
		}
	}
	await Promise.all(children.map(({child})=>{
		return new Promise((resolveClose)=>{
			if(null !== child.exitCode || null !== child.signalCode){
				resolveClose();
				return;
			}
			child.once('close',resolveClose);
		});
	}));
}

async function main(){
	for(const server of servers){
		const url = new URL(server.endpoint);
		const port = Number(url.port);
		await assertPortFree(port);
	}
	for(const server of servers){
		await startServer(server);
	}
	const signal = waitForSignal();
	const exit = watchChildExits();
	const ready = Promise.all(servers.map(async (server)=>{
		return {server,gid:await waitForServer(server)};
	}));
	const first = await Promise.race([
		ready.then((entries)=>({type:'ready',entries})),
		signal.then((value)=>({type:'signal',value})),
		exit.then((value)=>({type:'exit',value}))
	]);
	if('ready' !== first.type){
		if('exit' === first.type){
			throw new Error(`A debug server exited unexpectedly`);
		}
		return;
	}
	const serverIds = new Set(first.entries.map((entry)=>{
		return entry.gid;
	}));
	if(serverIds.size !== servers.length){
		throw new Error(
			'Each debug server must have an isolated database and UUID'
		);
	}
	for(const target of first.entries){
		for(const peer of first.entries){
			if(target.server.name !== peer.server.name){
				await registerPeer(target.server,{
					name:peer.server.name,
					gid:peer.gid,
					endpoint:peer.server.endpoint
				});
			}
		}
	}
	for(const {server} of children){
		console.log(`${server.name}: ${server.endpoint}`);
		console.log(`  bearer token: ${tokens.get(server.name)}`);
	}
	const outcome = await Promise.race([
		signal.then((value)=>({type:'signal',value})),
		exit.then((value)=>({type:'exit',value}))
	]);
	if('exit' === outcome.type){
		throw new Error(`${outcome.value.server.name} exited unexpectedly`);
	}
}

try{
	await main();
}
catch(error){
	console.error(error);
	process.exitCode = 1;
}
finally{
	await closeChildren();
}
