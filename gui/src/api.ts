/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Client for the PetQuery API. Paths are absolute, so the GUI must be
// served by the same origin as the API.

export type ServerEntry = {
	gid:uuid_t;
	uri:uri_t;
};

export type AuthMode = utf8_t;

export type AuthProvider = {
	name:utf8_t;
	login:'bearer'|'password'|'redirect';
	userManagement:bool_t;
};

export type AuthUser = {
	username:utf8_t;
	displayName:utf8_t;
	group:'admin'|'user';
	provider:utf8_t;
};

export type ManagedUser = AuthUser & {
	createdAt:utf8_t;
};

export type PetRecord = {
	gid:utf8_t;
	name:utf8_t;
	species:utf8_t;
	owner_contact:utf8_t;
	notes:utf8_t;
	source:{
		favicon:uri_t;
		url:uri_t;
		name:utf8_t;
	};
	preview:uri_t;
	attributes:Array<{key:utf8_t;value:utf8_t}>;
	files:Array<uri_t>;
};

export type SearchResult = PetRecord;

export type SearchResponse = {
	success:bool_t;
	error:Array<utf8_t>;
	data:Array<SearchResult>;
};

export async function authenticate(token:utf8_t):Promise<void>{
	await getConfig(token);
}

export async function getAuthProviders():Promise<{
	mode:AuthMode;
	providers:Array<AuthProvider>;
}>{
	const data = await request('GET','/auth/mode','',undefined);
	if(!isRecord(data)
	|| !isNonEmptyString(data.mode)
	|| !Array.isArray(data.providers)){
		throw new Error('Invalid authentication provider response');
	}
	const providers:Array<AuthProvider> = [];
	for(const value of data.providers){
		if(!isRecord(value)
		|| 'string' !== typeof value.name
		|| '' === value.name
		|| !isAuthLogin(value.login)
		|| 'boolean' !== typeof value.userManagement){
			throw new Error('Invalid authentication provider entry');
		}
		providers.push({
			name:value.name,
			login:value.login,
			userManagement:value.userManagement
		});
	}
	return {mode:data.mode,providers};
}

export async function getAuthMode():Promise<AuthMode>{
	return (await getAuthProviders()).mode;
}

export function getProviderLoginUrl(provider:utf8_t):utf8_t{
	return `/auth/providers/${encodeURIComponent(provider)}/login`;
}

export async function getSession():Promise<AuthUser|null>{
	try{
		const data = await request('GET','/auth/session','',undefined);
		return readAuthUser(data);
	}
	catch(error){
		if(error instanceof Error
		&& error.message.startsWith('HTTP 401')){
			return null;
		}
		throw error;
	}
}

export async function loginUser(
	provider:utf8_t,
	username:utf8_t = '',
	password:utf8_t = '',
	bearerToken:utf8_t = ''
):Promise<AuthUser>{
	const body:{provider:utf8_t;username?:utf8_t;password?:utf8_t} = {
		provider
	};
	if('' !== username){
		body.username = username;
	}
	if('' !== password && '' === bearerToken){
		body.password = password;
	}
	const data = await request(
		'POST',
		'/auth/login',
		bearerToken,
		body
	);
	return readAuthUser(data);
}

export async function logout():Promise<void>{
	await request('POST','/auth/logout','',undefined);
}

export async function listUsers(
	token:utf8_t,
	provider?:utf8_t
):Promise<Array<ManagedUser>>{
	const path = undefined === provider
		? '/auth/users'
		: `/auth/users?provider=${encodeURIComponent(provider)}`;
	const data = await request('GET',path,token,undefined);
	if(!Array.isArray(data)){
		throw new Error('Invalid user list response');
	}
	const ret:Array<ManagedUser> = [];
	for(const value of data){
		ret.push(readManagedUser(value));
	}
	return ret;
}

export async function createUser(
	token:utf8_t,
	user:{
		username:utf8_t;
		displayName:utf8_t;
		group:'admin'|'user';
		password:utf8_t;
	},
	provider?:utf8_t
):Promise<ManagedUser>{
	const body = undefined === provider
		? user
		: {...user,provider};
	const data = await request('POST','/auth/users',token,body);
	return readManagedUser(data);
}

export async function updateUser(
	token:utf8_t,
	username:utf8_t,
	user:{
		displayName:utf8_t;
		group:'admin'|'user';
		password:utf8_t;
	},
	provider?:utf8_t
):Promise<ManagedUser>{
	const body = undefined === provider
		? user
		: {...user,provider};
	const data = await request(
		'PUT',
		`/auth/users/${encodeURIComponent(username)}`,
		token,
		body
	);
	return readManagedUser(data);
}

export async function deleteUser(
	token:utf8_t,
	username:utf8_t,
	provider?:utf8_t
):Promise<void>{
	const path = undefined === provider
		? `/auth/users/${encodeURIComponent(username)}`
		: `/auth/users/${encodeURIComponent(username)}`
			+ `?provider=${encodeURIComponent(provider)}`;
	await request(
		'DELETE',
		path,
		token,
		undefined
	);
}

export async function listPets(token:utf8_t):Promise<Array<PetRecord>>{
	const data = await request('GET','/api/pets',token,undefined);
	if(!Array.isArray(data)){
		throw new Error('Invalid pet list response');
	}
	return data.map(readSearchResult);
}

export async function createPet(
	token:utf8_t,
	pet:PetRecord
):Promise<PetRecord>{
	const data = await request('POST','/api/pets',token,pet);
	return readSearchResult(data);
}

export async function updatePet(
	token:utf8_t,
	gid:utf8_t,
	pet:PetRecord
):Promise<PetRecord>{
	const data = await request(
		'PUT',
		`/api/pets/${encodeURIComponent(gid)}`,
		token,
		pet
	);
	return readSearchResult(data);
}

export async function deletePet(
	token:utf8_t,
	gid:utf8_t
):Promise<void>{
	await request(
		'DELETE',
		`/api/pets/${encodeURIComponent(gid)}`,
		token,
		undefined
	);
}

export async function ping():Promise<uuid_t>{
	const data = await request('GET','/api/ping/get','',undefined);
	return readStringFromRecord(data,'gid');
}

export async function listServers():Promise<Array<ServerEntry>>{
	const data = await request('GET','/api/server/get','',undefined);
	if(!Array.isArray(data)){
		throw new Error('Invalid server list response');
	}
	const ret:Array<ServerEntry> = [];
	for(const entry of data){
		if(!isRecord(entry)
		|| 'string' !== typeof entry.gid
		|| 'string' !== typeof entry.uri){
			throw new Error('Invalid server list entry');
		}
		ret.push({gid:entry.gid,uri:entry.uri});
	}
	return ret;
}

export async function searchPets(
	token:utf8_t,
	query:utf8_t,
	files:Array<File>
):Promise<SearchResponse>{
	let body:unknown = {query};
	if(0 < files.length){
		const formData = new FormData();
		formData.set('query',query);
		for(const [index,file] of files.entries()){
			formData.append(`file_${index}`,file,file.name);
		}
		body = formData;
	}
	const envelope = await requestEnvelope(
		'POST',
		'/api/pets/search',
		token,
		body
	);
	const success = envelope.success;
	if('boolean' !== typeof success){
		throw new Error('Invalid search response status');
	}
	const errors = readStringArray(envelope.error,'search errors');
	if(!Array.isArray(envelope.data)){
		throw new Error('Invalid search response data');
	}
	const data:Array<SearchResult> = [];
	for(const value of envelope.data){
		data.push(readSearchResult(value));
	}
	return {success,error:errors,data};
}

// Adds the server, or replaces its URI if the UUID already exists.
export async function addServer(
	token:utf8_t,
	gid:uuid_t,
	uri:uri_t
):Promise<void>{
	await request('PUT',serverPath('put',gid),token,{uri});
}

export async function deleteServer(
	token:utf8_t,
	gid:uuid_t
):Promise<void>{
	await request('DELETE',serverPath('delete',gid),token,undefined);
}

// Mirrors PetQueryServerConfigValues in src/pet/query/server/config.ts.
export type ConfigValues = {
	gid:uuid_t;
	http:{port:uint16_t};
	authenticate:{
		mode:utf8_t;
		providers:Array<utf8_t>;
		plugin_options:Record<utf8_t,json_t>;
		bearer:Array<utf8_t>;
		session:{
			cookie_name:utf8_t;
			max_age:milliseconds_t;
			secure:bool_t;
		};
		lmdb:{
			users_name:utf8_t;
			sessions_name:utf8_t;
		};
		ldap:{
			url:uri_t;
			bind_dn:utf8_t;
			bind_password:utf8_t;
			base_dn:utf8_t;
			user_filter:utf8_t;
			admin_group:utf8_t;
		};
		oidc:{
			issuer:uri_t;
			client_id:utf8_t;
			client_secret:utf8_t;
			redirect_uri:uri_t;
			scopes:utf8_t;
			admin_group:utf8_t;
		};
	};
	file:{upload:{enabled:bool_t;max_file_size:uint_t}};
	max_results_per_module:uint_t;
	max_results_total:uint_t;
	index:{
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
		gui:{enabled:bool_t};
	};
};

type ConfigValuesInput = Omit<ConfigValues,'authenticate'> & {
	authenticate:
		Omit<
			ConfigValues['authenticate'],
			'providers'|'plugin_options'
		> & {
			providers?:Array<utf8_t>;
			plugin_options?:Record<utf8_t,json_t>;
		};
};

export type ConfigState = {
	active:ConfigValues;
	saved:ConfigValues|null;
	savedError:utf8_t|null;
	plugins:Array<utf8_t>;
};

export async function getConfig(token:utf8_t):Promise<ConfigState>{
	const data = await request('GET','/api/config/get',token,undefined);
	if(!isRecord(data)){
		throw new Error('Invalid config response');
	}
	const savedError = data.saved_error;
	const active = normalizeConfigValues(data.active);
	if(null === active){
		throw new Error('Invalid active config response');
	}
	let savedConfig:ConfigValues|null = null;
	if(null !== data.saved && undefined !== data.saved){
		savedConfig = normalizeConfigValues(data.saved);
		if(null === savedConfig){
			throw new Error('Invalid saved config response');
		}
	}
	if(null !== savedError && 'string' !== typeof savedError){
		throw new Error('Invalid config error response');
	}
	return {
		active,
		saved:savedConfig,
		savedError,
		plugins:readStringArray(data.plugins,'config plugins')
	};
}

// Saves values to the config file and returns them as the server stored
// them. They take effect when the server restarts.
export async function saveConfig(
	token:utf8_t,
	values:ConfigValues
):Promise<ConfigValues>{
	const data = await request('PUT','/api/config/put',token,values);
	if(!isRecord(data)){
		throw new Error('Invalid save response');
	}
	const saved = normalizeConfigValues(data);
	if(null === saved){
		throw new Error('Invalid save response');
	}
	return saved;
}

function serverPath(action:utf8_t,gid:uuid_t):utf8_t{
	return `/api/server/${action}/${encodeURIComponent(gid)}`;
}

// Sends a request and returns the response's data field.
async function request(
	method:utf8_t,
	path:utf8_t,
	token:utf8_t,
	body:unknown
):Promise<unknown>{
	const envelope = await requestEnvelope(method,path,token,body);
	if(true !== envelope.success){
		const message = readErrorMessage(envelope.error);
		throw new Error('' === message ? 'Request failed' : message);
	}
	return envelope.data;
}

async function requestEnvelope(
	method:utf8_t,
	path:utf8_t,
	token:utf8_t,
	body:unknown
):Promise<Record<utf8_t,unknown>>{
	const headers:Record<utf8_t,utf8_t> = {
		accept:'application/json'
	};
	const init:RequestInit = {
		method,
		headers,
		credentials:'include'
	};
	if('' !== token){
		headers.authorization = `Bearer ${token}`;
	}
	if(undefined !== body){
		if(body instanceof FormData){
			init.body = body;
		}else{
			headers['content-type'] = 'application/json';
			init.body = JSON.stringify(body);
		}
	}
	const response = await fetch(path,init);
	const json = parseJson(await response.text());
	if(!isRecord(json)){
		throw new Error(
			`HTTP ${response.status} ${response.statusText}`
		);
	}
	if(!response.ok){
		const message = readErrorMessage(json.error);
		if('' !== message){
			throw new Error(message);
		}
		if(403 === response.status){
			throw new Error(
				'HTTP 403 Forbidden: check the bearer token'
			);
		}
		throw new Error(
			`HTTP ${response.status} ${response.statusText}`
		);
	}
	return json;
}

function parseJson(text:utf8_t):unknown{
	try{
		return JSON.parse(text);
	}
	catch(UNUSED_e){
		return null;
	}
}

function readAuthUser(value:unknown):AuthUser{
	const candidate = isRecord(value) && isRecord(value.user)
		? value.user
		: value;
	if(!isRecord(candidate)
	|| 'string' !== typeof candidate.username
	|| 'string' !== typeof candidate.displayName
	|| !isUserGroup(candidate.group)
	|| !isAuthMode(candidate.provider)){
		throw new Error('Invalid authenticated user response');
	}
	return {
		username:candidate.username,
		displayName:candidate.displayName,
		group:candidate.group,
		provider:candidate.provider
	};
}

function readManagedUser(value:unknown):ManagedUser{
	if(!isRecord(value)
	|| 'string' !== typeof value.createdAt){
		throw new Error('Invalid managed user response');
	}
	return {
		...readAuthUser(value),
		createdAt:value.createdAt
	};
}

function isAuthMode(value:unknown):value is AuthMode{
	return isNonEmptyString(value);
}

function isAuthLogin(
	value:unknown
):value is AuthProvider['login']{
	return 'bearer' === value
		|| 'password' === value
		|| 'redirect' === value;
}

function isUserGroup(value:unknown):value is 'admin'|'user'{
	return 'admin' === value || 'user' === value;
}

function readSearchResult(value:unknown):SearchResult{
	if(!isRecord(value) || !isRecord(value.source)){
		throw new Error('Invalid search result');
	}
	const source = value.source;
	if(!Array.isArray(value.attributes)){
		throw new Error('Invalid result attributes');
	}
	const attributes:Array<{key:utf8_t;value:utf8_t}> = [];
	for(const attribute of value.attributes){
		if(!isRecord(attribute)){
			throw new Error('Invalid result attribute');
		}
		attributes.push({
			key:readString(attribute.key,'attribute key'),
			value:readString(attribute.value,'attribute value')
		});
	}
	return {
		gid:readString(value.gid,'pet GID'),
		name:readString(value.name,'pet name'),
		species:readString(value.species,'pet species'),
		owner_contact:readString(value.owner_contact,'owner contact'),
		notes:readString(value.notes,'pet notes'),
		source:{
			favicon:readString(source.favicon,'result favicon'),
			url:readString(source.url,'result URL'),
			name:readString(source.name,'result source name')
		},
		preview:readString(value.preview,'result preview'),
		files:readStringArray(value.files,'result files'),
		attributes
	};
}

function readStringFromRecord(
	value:unknown,
	key:utf8_t
):utf8_t{
	if(!isRecord(value)){
		throw new Error('Invalid response');
	}
	return readString(value[key],key);
}

function readString(value:unknown,label:utf8_t):utf8_t{
	if('string' !== typeof value){
		throw new Error(`Invalid ${label}`);
	}
	return value;
}

function readStringArray(
	value:unknown,
	label:utf8_t
):Array<utf8_t>{
	if(!Array.isArray(value)){
		throw new Error(`Invalid ${label}`);
	}
	const ret:Array<utf8_t> = [];
	for(const item of value){
		ret.push(readString(item,label));
	}
	return ret;
}

function readErrorMessage(value:unknown):utf8_t{
	if(!Array.isArray(value)){
		return '';
	}
	const errors:Array<utf8_t> = [];
	for(const item of value){
		if('string' === typeof item){
			errors.push(item);
		}
	}
	return errors.join('\n');
}

function isInteger(value:unknown):value is number{
	return 'number' === typeof value && Number.isInteger(value);
}

function normalizeConfigValues(value:unknown):ConfigValues|null{
	if(!isConfigValues(value)){
		return null;
	}
	const providers = Array.from(new Set(
		value.authenticate.providers
		?? [value.authenticate.mode,'bearer']
	));
	return {
		...value,
		authenticate:{
			...value.authenticate,
			providers,
			plugin_options:value.authenticate.plugin_options ?? {}
		}
	};
}

function isConfigValues(value:unknown):value is ConfigValuesInput{
	if(!isRecord(value)
	|| !isNonEmptyString(value.gid)
	|| !isRecord(value.http)
	|| !isRecord(value.authenticate)
	|| !isRecord(value.authenticate.session)
	|| !isRecord(value.authenticate.lmdb)
	|| !isRecord(value.authenticate.ldap)
	|| !isRecord(value.authenticate.oidc)
	|| !isRecord(value.file)
	|| !isRecord(value.file.upload)
	|| !isRecord(value.index)
	|| !isRecord(value.index.sync)
	|| !isRecord(value.route)
	|| !isRecord(value.route.api)
	|| !isRecord(value.route.json)
	|| !isRecord(value.route['/'])
	|| !isRecord(value.route.gui)){
		return false;
	}
	return isInteger(value.http.port)
		&& isNonEmptyString(value.authenticate.mode)
		&& Array.isArray(value.authenticate.bearer)
		&& (undefined === value.authenticate.providers
			|| Array.isArray(value.authenticate.providers)
				&& value.authenticate.providers.every(isNonEmptyString))
		&& (undefined === value.authenticate.plugin_options
			|| isJsonRecord(value.authenticate.plugin_options))
		&& 'string' === typeof value.authenticate.session.cookie_name
		&& isInteger(value.authenticate.session.max_age)
		&& 'boolean' === typeof value.authenticate.session.secure
		&& 'string' === typeof value.authenticate.lmdb.users_name
		&& 'string' === typeof value.authenticate.lmdb.sessions_name
		&& 'string' === typeof value.authenticate.ldap.url
		&& 'string' === typeof value.authenticate.ldap.bind_dn
		&& 'string' === typeof value.authenticate.ldap.bind_password
		&& 'string' === typeof value.authenticate.ldap.base_dn
		&& 'string' === typeof value.authenticate.ldap.user_filter
		&& 'string' === typeof value.authenticate.ldap.admin_group
		&& 'string' === typeof value.authenticate.oidc.issuer
		&& 'string' === typeof value.authenticate.oidc.client_id
		&& 'string' === typeof value.authenticate.oidc.client_secret
		&& 'string' === typeof value.authenticate.oidc.redirect_uri
		&& 'string' === typeof value.authenticate.oidc.scopes
		&& 'string' === typeof value.authenticate.oidc.admin_group
		&& 'boolean' === typeof value.file.upload.enabled
		&& isInteger(value.file.upload.max_file_size)
		&& isInteger(value.max_results_per_module)
		&& isInteger(value.max_results_total)
		&& 'boolean' === typeof value.index.sync.enabled
		&& isInteger(value.index.sync.interval)
		&& isInteger(value.index.sync.timeout)
		&& isInteger(value.index.sync.max_servers)
		&& 'boolean' === typeof value.route.api.enabled
		&& Array.isArray(value.route.api.plugins)
		&& 'boolean' === typeof value.route.json.enabled
		&& 'boolean' === typeof value.route['/'].enabled
		&& 'boolean' === typeof value.route.gui.enabled
		&& value.authenticate.bearer.every(isString)
		&& value.route.api.plugins.every(isString);
}

function isString(value:unknown):value is string{
	return 'string' === typeof value;
}

function isNonEmptyString(value:unknown):value is string{
	return 'string' === typeof value && '' !== value;
}

function isJson(value:unknown):value is json_t{
	if(null === value
	|| 'string' === typeof value
	|| 'boolean' === typeof value){
		return true;
	}
	if('number' === typeof value){
		return Number.isFinite(value);
	}
	if(Array.isArray(value)){
		return value.every(isJson);
	}
	if(isRecord(value)){
		return Object.values(value).every(isJson);
	}
	return false;
}

function isJsonRecord(
	value:unknown
):value is Record<utf8_t,json_t>{
	return isRecord(value) && Object.values(value).every(isJson);
}

function isRecord(value:unknown):value is Record<utf8_t,unknown>{
	return 'object' === typeof value
		&& null !== value
		&& !Array.isArray(value);
}
