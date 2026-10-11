/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Client for the PetQuery server-index and config API. Paths are absolute,
// so the GUI must be served by the same origin as the API.

export type ServerEntry = {
	uuid:uuid_t;
	uri:uri_t;
};

export async function ping():Promise<uuid_t>{
	const data = await request('GET','/api/ping','',undefined);
	const uuid:unknown = isRecord(data) ? data.uuid : undefined;
	if('string' !== typeof uuid){
		throw new Error('Invalid ping response');
	}
	return uuid;
}

export async function listServers():Promise<Array<ServerEntry>>{
	const data = await request('GET','/api/server','',undefined);
	if(!Array.isArray(data)){
		throw new Error('Invalid server list response');
	}
	const ret:Array<ServerEntry> = [];
	for(const entry of data){
		if(isRecord(entry)
		&& 'string' === typeof entry.uuid
		&& 'string' === typeof entry.uri){
			ret.push({uuid:entry.uuid,uri:entry.uri});
		}
	}
	return ret;
}

// Adds the server, or replaces its URI if the UUID already exists.
export async function addServer(
	token:utf8_t,
	uuid:uuid_t,
	uri:uri_t
):Promise<void>{
	await request('PUT',serverPath(uuid),token,{uri});
}

export async function deleteServer(
	token:utf8_t,
	uuid:uuid_t
):Promise<void>{
	await request('DELETE',serverPath(uuid),token,undefined);
}

// Mirrors PetQueryServerConfigValues in src/pet/query/server/config.ts.
export type ConfigValues = {
	http:{port:uint16_t};
	authenticate:{bearer:Array<utf8_t>};
	file:{upload:{enabled:bool_t;max_file_size:uint_t}};
	max_results_per_module:uint_t;
	max_results_total:uint_t;
	server_index:{
		sync:{
			enabled:bool_t;
			interval:uint_t;
			timeout:uint_t;
			max_servers:uint_t;
		};
	};
	route:{
		api:{enabled:bool_t;plugins:Array<utf8_t>};
		json:{enabled:bool_t};
		'/':{enabled:bool_t};
		admin:{enabled:bool_t};
	};
};

export type ConfigState = {
	// Values the running server uses.
	active:ConfigValues;
	// Values in the config file, applied on restart; null if never saved.
	saved:ConfigValues|null;
	// Why the config file could not be read, if it could not.
	savedError:utf8_t|null;
	// Plugin names allowed in route.api.plugins.
	plugins:Array<utf8_t>;
};

// The server validates the response shape it produces, so it is trusted.
export async function getConfig(token:utf8_t):Promise<ConfigState>{
	const data = await request('GET','/api/config',token,undefined);
	if(!isRecord(data) || !isRecord(data.active)
	|| !Array.isArray(data.plugins)){
		throw new Error('Invalid config response');
	}
	return {
		active:data.active as ConfigValues,
		saved:isRecord(data.saved) ? data.saved as ConfigValues : null,
		savedError:'string' === typeof data.saved_error
			? data.saved_error
			: null,
		plugins:data.plugins.map(String)
	};
}

// Saves values to the config file and returns them as the server stored
// them. They take effect when the server restarts.
export async function saveConfig(
	token:utf8_t,
	values:ConfigValues
):Promise<ConfigValues>{
	const data = await request('PUT','/api/config',token,values);
	if(!isRecord(data) || !isRecord(data.saved)){
		throw new Error('Invalid save response');
	}
	return data.saved as ConfigValues;
}

function serverPath(uuid:uuid_t):utf8_t{
	return `/api/server/${encodeURIComponent(uuid)}`;
}

// Sends the request and returns the response's data field. Rejects with the
// server's error messages or the HTTP status.
async function request(
	method:utf8_t,
	path:utf8_t,
	token:utf8_t,
	body:unknown
):Promise<unknown>{
	const headers:Record<utf8_t,utf8_t> = {accept:'application/json'};
	const init:RequestInit = {method,headers};
	if('' !== token){
		headers.authorization = `Bearer ${token}`;
	}
	if(undefined !== body){
		headers['content-type'] = 'application/json';
		init.body = JSON.stringify(body);
	}
	const response = await fetch(path,init);
	const json = parseJson(await response.text());
	if(response.ok && isRecord(json) && true === json.success){
		return json.data;
	}
	const errors = isRecord(json) && Array.isArray(json.error)
		? json.error.map(String)
		: [];
	if(0 < errors.length){
		throw new Error(errors.join('\n'));
	}
	if(403 === response.status){
		throw new Error('HTTP 403 Forbidden: check the bearer token');
	}
	throw new Error(`HTTP ${response.status} ${response.statusText}`);
}

function parseJson(text:utf8_t):unknown{
	try{
		return JSON.parse(text);
	}
	catch(UNUSED_e){
		return null;
	}
}

function isRecord(value:unknown):value is Record<utf8_t,unknown>{
	return 'object' === typeof value
		&& null !== value
		&& !Array.isArray(value);
}
