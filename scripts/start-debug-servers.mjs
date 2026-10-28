import { createInterface } from 'node:readline/promises';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const servers = [
	{
		name:'server-a',
		config:'config/debug/server-a.json',
		endpoint:'http://127.0.0.1:50101'
	},
	{
		name:'server-b',
		config:'config/debug/server-b.json',
		endpoint:'http://127.0.0.1:50102'
	},
	{
		name:'server-c',
		config:'config/debug/server-c.json',
		endpoint:'http://127.0.0.1:50103'
	}
];

const children = [];
const apiClients = new Map();

async function promptPassword(){
	if(!process.stdin.isTTY
	|| 'function' !== typeof process.stdin.setRawMode){
		throw new Error('debug:multi requires an interactive terminal');
	}
	process.stdout.write('Admin password: ');
	process.stdin.setRawMode(true);
	process.stdin.resume();
	return new Promise((resolvePassword,rejectPassword)=>{
		let password = '';
		function cleanup(){
			process.stdin.setRawMode(false);
			process.stdin.pause();
			process.stdin.removeListener('data',onData);
		}
		function onData(chunk){
			for(const character of chunk.toString('utf8')){
				if('\u0003' === character){
					cleanup();
					rejectPassword(new Error('Password entry cancelled'));
					return;
				}
				if('\r' === character || '\n' === character){
					process.stdout.write('\n');
					cleanup();
					resolvePassword(password);
					return;
				}
				if('\u007f' === character || '\b' === character){
					password = password.slice(0,-1);
					continue;
				}
				password += character;
			}
		}
		process.stdin.on('data',onData);
	});
}

async function promptAdminCredentials(){
	const terminal = createInterface({
		input:process.stdin,
		output:process.stdout
	});
	let username;
	try{
		username = (await terminal.question(
			'Admin username [admin]: '
		)).trim();
	}
	finally{
		terminal.close();
	}
	if('' === username){
		username = 'admin';
	}
	const password = await promptPassword();
	if('' === password){
		throw new Error('Admin password is required');
	}
	return {username,password};
}

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

async function startServer(server){
	const child = spawn(process.execPath,[
		resolve('dist/index.js'),
		'--config',
		resolve(server.config)
	],{
		cwd:process.cwd(),
		env:process.env,
		stdio:'inherit'
	});
	children.push({server,child});
}

async function getEnvelope(
	url,
	options = {}
){
	const init = {
		...options,
		signal:AbortSignal.timeout(2000)
	};
	const response = await fetch(url,init);
	const envelope = await response.json();
	if(!response.ok){
		throw new Error(`HTTP ${response.status} for ${url}`);
	}
	if('object' !== typeof envelope || null === envelope
	|| Array.isArray(envelope)){
		throw new Error(`Invalid response from ${url}`);
	}
	if(true !== envelope.success){
		const message = Array.isArray(envelope.error)
			? envelope.error.join('\n')
			: '';
		throw new Error(
			'' === message ? `Request failed for ${url}` : message
		);
	}
	return {response,envelope};
}

async function getServerUid(server){
	const result = await getEnvelope(`${server.endpoint}/api/ping/get`);
	const data = result.envelope.data;
	if('object' !== typeof data || null === data
	|| Array.isArray(data) || 'string' !== typeof data.gid){
		throw new Error(`Invalid ping response from ${server.name}`);
	}
	return data.gid;
}

async function waitForServer(
	server
){
	let lastError;
	for(let attempt = 0; attempt < 60; attempt++){
		try{
			return await getServerUid(server);
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

async function getAdminSession(
	server,
	credentials
){
	const modeResponse = await getEnvelope(
		`${server.endpoint}/auth/mode`
	);
	const modeData = modeResponse.envelope.data;
	if('object' !== typeof modeData || null === modeData
	|| Array.isArray(modeData)
	|| 'boolean' !== typeof modeData.setupRequired){
		throw new Error(`Invalid auth mode response from ${server.name}`);
	}
	const setupRequired = modeData.setupRequired;
	const path = setupRequired
		? '/auth/setup'
		: '/auth/login';
	const body = setupRequired
		? credentials
		: {...credentials,provider:'lmdb'};
	const result = await getEnvelope(`${server.endpoint}${path}`,{
		method:'POST',
		headers:{
			accept:'application/json',
			'content-type':'application/json',
			origin:server.endpoint
		},
		body:JSON.stringify(body)
	});
	const setCookie = result.response.headers.get('set-cookie');
	if(null === setCookie){
		throw new Error(`No admin session cookie from ${server.name}`);
	}
	const separator = setCookie.indexOf(';');
	const cookie = 0 > separator
		? setCookie
		: setCookie.slice(0,separator);
	if('' === cookie){
		throw new Error(`Empty admin session cookie from ${server.name}`);
	}
	return cookie;
}

async function createPeerApiClient(
	server,
	cookie
){
	const result = await getEnvelope(
		`${server.endpoint}/auth/api-clients`,
		{
			method:'POST',
			headers:{
				accept:'application/json',
				'content-type':'application/json',
				cookie
			},
			body:JSON.stringify({
				name:'debug-peer-registration',
				allowedIps:['127.0.0.1'],
				permissions:['PUT /api/server/put/:gid']
			})
		}
	);
	const data = result.envelope.data;
	if('object' !== typeof data || null === data
	|| Array.isArray(data)){
		throw new Error(`Invalid API client response from ${server.name}`);
	}
	const client = data.client;
	const token = data.token;
	if('object' !== typeof client || null === client
	|| Array.isArray(client) || 'string' !== typeof client.id
	|| 'string' !== typeof token){
		throw new Error(`Invalid API client response from ${server.name}`);
	}
	apiClients.set(server.name,{
		server,
		id:client.id,
		token,
		cookie
	});
}

async function registerPeer(
	target,
	peer
){
	const client = apiClients.get(target.name);
	if(undefined === client){
		throw new Error(`Missing API client for ${target.name}`);
	}
	const path = `${target.endpoint}/api/server/put/`
		+encodeURIComponent(peer.gid);
	await getEnvelope(path,{
		method:'PUT',
		headers:{
			authorization:`Bearer ${client.token}`,
			'content-type':'application/json'
		},
		body:JSON.stringify({uri:peer.endpoint})
	});
}

async function revokeApiClient(
	client
){
	const path = `${client.server.endpoint}/auth/api-clients/`
		+encodeURIComponent(client.id);
	await getEnvelope(path,{
		method:'DELETE',
		headers:{cookie:client.cookie}
	});
}

async function revokeApiClients(){
	const pending = [];
	for(const client of apiClients.values()){
		pending.push(revokeApiClient(client));
	}
	const results = await Promise.allSettled(pending);
	const errors = [];
	for(const result of results){
		if('rejected' === result.status){
			errors.push(result.reason);
		}
	}
	apiClients.clear();
	if(0 < errors.length){
		throw new AggregateError(errors,'Failed to revoke debug API clients');
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
			child.once('close',()=>{
				resolveClose();
			});
		});
	}));
}

async function main(){
	for(const server of servers){
		const url = new URL(server.endpoint);
		const port = Number(url.port);
		await assertPortFree(port);
	}
	const credentials = await promptAdminCredentials();
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
			throw new Error('A debug server exited unexpectedly');
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
	for(const entry of first.entries){
		const cookie = await getAdminSession(entry.server,credentials);
		await createPeerApiClient(entry.server,cookie);
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
	try{
		await revokeApiClients();
	}
	finally{
		await closeChildren();
	}
}
