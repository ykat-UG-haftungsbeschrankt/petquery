/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchemaApiAuthLoginPostResponse } from '#schema/api/auth/login/post/response.js';
import { PetQuerySchemaApiAuthLogoutPostResponse } from '#schema/api/auth/logout/post/response.js';
import { PetQuerySchemaApiAuthModeGetResponse } from '#schema/api/auth/mode/get/response.js';
import { PetQuerySchemaApiAuthSessionGetResponse } from '#schema/api/auth/session/get/response.js';
import { PetQuerySchemaApiAuthUsersDeleteResponse } from '#schema/api/auth/users/delete/response.js';
import { PetQuerySchemaApiAuthUsersGetResponse } from '#schema/api/auth/users/get/response.js';
import { PetQuerySchemaApiAuthUsersPostResponse } from '#schema/api/auth/users/post/response.js';
import { PetQuerySchemaApiAuthUsersPutResponse } from '#schema/api/auth/users/put/response.js';
import { PetQuerySchemaApiConfigGetResponse } from '#schema/api/config/get/response.js';
import { PetQuerySchemaApiConfigPutResponse } from '#schema/api/config/put/response.js';
import { PetQuerySchemaApiEnvelope } from '#schema/api/envelope.js';
import { PetQuerySchemaApiLogLevelGetResponse } from '#schema/api/log/level/get/response.js';
import { PetQuerySchemaApiLogRequestGetResponse } from '#schema/api/log/request/get/response.js';
import { PetQuerySchemaApiPetDeleteResponse } from '#schema/api/pet/delete/response.js';
import { PetQuerySchemaApiPingGetResponse } from '#schema/api/ping/get/response.js';
import { PetQuerySchemaApiServerDeleteResponse } from '#schema/api/server/delete/response.js';
import { PetQuerySchemaApiServerGetResponse } from '#schema/api/server/get/response.js';
import { PetQuerySchemaApiServerPutResponse } from '#schema/api/server/put/response.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';

import type { PetQuerySchemaApiAuthManagedUserType } from '#schema/api/auth/user.js';
import type { PetQuerySchemaApiAuthModeGetResponseType } from '#schema/api/auth/mode/get/response.js';
import type { PetQuerySchemaApiAuthUserType } from '#schema/api/auth/user.js';
import type { PetQuerySchemaApiAuthUsersGetResponseType } from '#schema/api/auth/users/get/response.js';
import type { PetQuerySchemaApiConfigGetResponseType } from '#schema/api/config/get/response.js';
import type { PetQuerySchemaApiEnvelopeType } from '#schema/api/envelope.js';
import type { PetQuerySchemaApiLogLevelGetResponseType } from '#schema/api/log/level/get/response.js';
import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { PetQuerySchemaServerDatabaseIndexEntryType } from '#schema/server/database/index/entry.js';
import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';

// Browser client for the PetQuery API. Requests use the same origin as
// the server so its session cookies are included.

export type ServerEntry = PetQuerySchemaServerDatabaseIndexEntryType;

export type AuthMode = PetQuerySchemaApiAuthModeGetResponseType['mode'];

export type AuthProvider =
	PetQuerySchemaApiAuthModeGetResponseType['providers'][number];

export type AuthUser = PetQuerySchemaApiAuthUserType;

export type ManagedUser = PetQuerySchemaApiAuthManagedUserType;

export type PetRecord = PetQuerySchemaServerDatabasePetEntryType;

export type PetSighting = NonNullable<PetRecord['last_seen']>;

export type SearchResult = PetRecord;

export type SearchResponse =
	Omit<PetQuerySchemaApiEnvelopeType,'data'> & {
		data:Array<SearchResult>;
	};

export type ConfigValues =
	Omit<
		PetQuerySchemaServerDatabaseConfigEntryType,
		'authenticate'
	> & {
		authenticate:
			Omit<
				PetQuerySchemaServerDatabaseConfigEntryType[
					'authenticate'
				],
				'providers'|'plugin_options'
			> & {
				providers:Array<utf8_t>;
				plugin_options:Record<utf8_t,json_t>;
			};
	};

export type ConfigState =
	Omit<
		PetQuerySchemaApiConfigGetResponseType,
		'active'|'saved'
	> & {
		active:ConfigValues;
		saved:ConfigValues|null;
	};

export type LogLevel = 'error'|'warn'|'info'|'debug';

export type LogEntry =
	Omit<PetQuerySchemaApiLogLevelGetResponseType[number],'level'> & {
		level:LogLevel;
	};

export type RequestLogEntry = LogEntry;

type PetQueryJsonParser<T> = {
	fromJson(value:unknown):T;
};

const petRecordArrayParser:PetQueryJsonParser<Array<PetRecord>> = {
	fromJson(value:unknown):Array<PetRecord>{
		if(!Array.isArray(value)){
			throw new Error('Invalid pet record list');
		}
		return value.map((entry)=>{
			return PetQuerySchemaServerDatabasePetEntry.fromJson(entry);
		});
	}
};

export async function authenticate(token:utf8_t):Promise<void>{
	await getConfig(token);
}

export async function getAuthProviders():Promise<
	PetQuerySchemaApiAuthModeGetResponseType
>{
	return request(
		'GET',
		'/auth/mode',
		'',
		undefined,
		PetQuerySchemaApiAuthModeGetResponse
	);
}

export async function getAuthMode():Promise<AuthMode>{
	return (await getAuthProviders()).mode;
}

export function getProviderLoginUrl(provider:utf8_t):utf8_t{
	return `/auth/providers/${encodeURIComponent(provider)}/login`;
}

export async function getSession():Promise<AuthUser|null>{
	try{
		const data = await request(
			'GET',
			'/auth/session',
			'',
			undefined,
			PetQuerySchemaApiAuthSessionGetResponse
		);
		return data.user;
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
	const body:Pick<AuthUser,'provider'> & {
		username?:AuthUser['username'];
		password?:utf8_t;
	} = {
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
		body,
		PetQuerySchemaApiAuthLoginPostResponse
	);
	return data.user;
}

export async function logout():Promise<void>{
	await request(
		'POST',
		'/auth/logout',
		'',
		undefined,
		PetQuerySchemaApiAuthLogoutPostResponse
	);
}

export async function listUsers(
	token:utf8_t,
	provider?:utf8_t
):Promise<PetQuerySchemaApiAuthUsersGetResponseType>{
	const path = undefined === provider
		? '/auth/users'
		: `/auth/users?provider=${encodeURIComponent(provider)}`;
	return request(
		'GET',
		path,
		token,
		undefined,
		PetQuerySchemaApiAuthUsersGetResponse
	);
}

export async function createUser(
	token:utf8_t,
	user:Omit<ManagedUser,'createdAt'|'provider'> & {
		password:utf8_t;
	},
	provider?:utf8_t
):Promise<ManagedUser>{
	const body = undefined === provider
		? user
		: {...user,provider};
	return request(
		'POST',
		'/auth/users',
		token,
		body,
		PetQuerySchemaApiAuthUsersPostResponse
	);
}

export async function updateUser(
	token:utf8_t,
	username:utf8_t,
	user:Omit<
		ManagedUser,
		'createdAt'|'provider'|'username'
	> & {password:utf8_t},
	provider?:utf8_t
):Promise<ManagedUser>{
	const body = undefined === provider
		? user
		: {...user,provider};
	const data = await request(
		'PUT',
		`/auth/users/${encodeURIComponent(username)}`,
		token,
		body,
		PetQuerySchemaApiAuthUsersPutResponse
	);
	return data;
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
		undefined,
		PetQuerySchemaApiAuthUsersDeleteResponse
	);
}

export async function listPets(
	token:utf8_t
):Promise<Array<PetRecord>>{
	return request(
		'GET',
		'/api/pets',
		token,
		undefined,
		petRecordArrayParser
	);
}

export async function createPet(
	token:utf8_t,
	pet:PetRecord
):Promise<PetRecord>{
	return request(
		'POST',
		'/api/pets',
		token,
		pet,
		PetQuerySchemaServerDatabasePetEntry
	);
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
		pet,
		PetQuerySchemaServerDatabasePetEntry
	);
	return data;
}

export async function reportPetSighting(
	endpoint:utf8_t,
	gid:utf8_t,
	lastSeen:PetSighting
):Promise<PetRecord>{
	const base = new URL(endpoint);
	if(('https:' !== base.protocol && 'http:' !== base.protocol)
	|| '' !== base.username || '' !== base.password){
		throw new Error('Unsupported PetQuery reporting endpoint');
	}
	const url = new URL(
		`/api/pets/${encodeURIComponent(gid)}/sightings`,base
	);
	const response = await fetch(url,{
		method:'POST',
		credentials:'omit',
		redirect:'error',
		headers:{
			accept:'application/json',
			'content-type':'application/json'
		},
		body:JSON.stringify({last_seen:lastSeen})
	});
	const envelope = PetQuerySchemaApiEnvelope.fromJson(
		parseJson(await response.text())
	);
	if(!response.ok || !envelope.success){
		throw new Error(
			envelope.error.join('\n')
			|| `Sighting failed (HTTP ${response.status})`
		);
	}
	return PetQuerySchemaServerDatabasePetEntry.fromJson(envelope.data);
}

export async function deletePet(
	token:utf8_t,
	gid:utf8_t
):Promise<void>{
	await request(
		'DELETE',
		`/api/pets/${encodeURIComponent(gid)}`,
		token,
		undefined,
		PetQuerySchemaApiPetDeleteResponse
	);
}

export async function ping():Promise<uuid_t>{
	const data = await request(
		'GET',
		'/api/ping/get',
		'',
		undefined,
		PetQuerySchemaApiPingGetResponse
	);
	return data.gid;
}

// Returns the public API endpoint this server advertises for its own pets.
export async function getServerEndpoint():Promise<uri_t>{
	const data = await request(
		'GET',
		'/api/ping/get',
		'',
		undefined,
		PetQuerySchemaApiPingGetResponse
	);
	return data.uri;
}

export async function listServers():Promise<Array<ServerEntry>>{
	return request(
		'GET',
		'/api/server/get',
		'',
		undefined,
		PetQuerySchemaApiServerGetResponse
	);
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
	return {
		success:envelope.success,
		error:envelope.error,
		data:petRecordArrayParser.fromJson(envelope.data)
	};
}

// Adds the server, or replaces its URI if the UUID already exists.
export async function addServer(
	token:utf8_t,
	gid:uuid_t,
	uri:uri_t,
	adminContact:utf8_t,
	companyAddress:utf8_t
):Promise<void>{
	const body:Pick<
		ServerEntry,
		'uri'|'adminContact'|'companyAddress'
	> = {
		uri,
		adminContact,
		companyAddress
	};
	await request(
		'PUT',
		serverPath('put',gid),
		token,
		body,
		PetQuerySchemaApiServerPutResponse
	);
}

export async function deleteServer(
	token:utf8_t,
	gid:uuid_t
):Promise<void>{
	await request(
		'DELETE',
		serverPath('delete',gid),
		token,
		undefined,
		PetQuerySchemaApiServerDeleteResponse
	);
}

export async function getConfig(token:utf8_t):Promise<ConfigState>{
	const data = await request(
		'GET',
		'/api/config/get',
		token,
		undefined,
		PetQuerySchemaApiConfigGetResponse
	);
	const active = normalizeConfigValues(data.active);
	const savedConfig = null === data.saved
		? null
		: normalizeConfigValues(data.saved);
	return {
		active,
		saved:savedConfig,
		plugins:data.plugins
	};
}

export async function getLogEntries(
	token:utf8_t,
	level?:LogLevel,
	query:utf8_t = '',
	limit:size_t = 100
):Promise<Array<LogEntry>>{
	const params = new URLSearchParams();
	if(undefined !== level){
		params.set('level',level);
	}
	if('' !== query){
		params.set('query',query);
	}
	params.set('limit',String(limit));

	const data = await request(
		'GET',
		`/api/log/level/get?${params.toString()}`,
		token,
		undefined,
		PetQuerySchemaApiLogLevelGetResponse
	);
	return data.map(toLogEntry);
}

export async function getRequestLogEntries(
	token:utf8_t,
	query:utf8_t = '',
	limit:size_t = 100
):Promise<Array<RequestLogEntry>>{
	const params = new URLSearchParams();
	if('' !== query){
		params.set('query',query);
	}
	params.set('limit',String(limit));

	const data = await request(
		'GET',
		`/api/log/request/get?${params.toString()}`,
		token,
		undefined,
		PetQuerySchemaApiLogRequestGetResponse
	);
	return data.map(toLogEntry);
}

// Saves values to the config file and returns them as the server stored
// them. They take effect when the server restarts.
export async function saveConfig(
	token:utf8_t,
	values:ConfigValues
):Promise<ConfigValues>{
	const requestValues:PetQuerySchemaServerDatabaseConfigEntryType = values;
	const data = await request(
		'PUT',
		'/api/config/put',
		token,
		requestValues,
		PetQuerySchemaApiConfigPutResponse
	);
	return normalizeConfigValues(data);
}

function serverPath(action:utf8_t,gid:uuid_t):utf8_t{
	return `/api/server/${action}/${encodeURIComponent(gid)}`;
}

// Sends a request and validates the response data with its schema class.
async function request<T>(
	method:utf8_t,
	path:utf8_t,
	token:utf8_t,
	body:unknown,
	responseSchema:PetQueryJsonParser<T>
):Promise<T>{
	const envelope = await requestEnvelope(method,path,token,body);
	if(true !== envelope.success){
		const message = envelope.error.join('\n');
		throw new Error('' === message ? 'Request failed' : message);
	}
	return responseSchema.fromJson(envelope.data);
}

async function requestEnvelope(
	method:utf8_t,
	path:utf8_t,
	token:utf8_t,
	body:unknown
):Promise<PetQuerySchemaApiEnvelopeType>{
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
	if(!response.ok){
		const status = `HTTP ${response.status} ${response.statusText}`;
		if(!isRecord(json)){
			throw new Error(status);
		}
		const errorEnvelope = PetQuerySchemaApiEnvelope.fromJson(json);
		const message = errorEnvelope.error.join('\n');
		if('' !== message){
			throw new Error(`${status}: ${message}`);
		}
		if(403 === response.status){
			throw new Error(
				'HTTP 403 Forbidden: check the bearer token'
			);
		}
		throw new Error(status);
	}
	return PetQuerySchemaApiEnvelope.fromJson(json);
}

function parseJson(text:utf8_t):unknown{
	try{
		return JSON.parse(text);
	}
	catch(UNUSED_e){
		return null;
	}
}

function isLogLevel(value:unknown):value is LogLevel{
	return 'error' === value
		|| 'warn' === value
		|| 'info' === value
		|| 'debug' === value;
}

function toLogEntry(
	entry:PetQuerySchemaApiLogLevelGetResponseType[number]
):LogEntry{
	if(!isLogLevel(entry.level)){
		throw new Error('Invalid log level');
	}
	return {
		timestamp:entry.timestamp,
		level:entry.level,
		message:entry.message
	};
}

function normalizeConfigValues(
	value:PetQuerySchemaServerDatabaseConfigEntryType
):ConfigValues{
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

function isRecord(value:unknown):value is Record<utf8_t,unknown>{
	return 'object' === typeof value
		&& null !== value
		&& !Array.isArray(value);
}
