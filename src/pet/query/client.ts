/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaCheck} from '#petquery/schema.js';
import {PetQueryClientError} from '#petquery/client/error.js';
import {PetQuerySchemaApiPingGetResponse} from
	'#schema/api/ping/get/response.js';
import {PetQuerySchemaApiAuthModeGetResponse} from
	'#schema/api/auth/mode/get/response.js';
import {PetQuerySchemaApiAuthSessionGetResponse} from
	'#schema/api/auth/session/get/response.js';
import {PetQuerySchemaApiAuthLoginPostResponse} from
	'#schema/api/auth/login/post/response.js';
import {
	PetQuerySchemaApiAuthUser,
	PetQuerySchemaApiAuthManagedUser,
	type PetQuerySchemaApiAuthGroupType
} from '#schema/api/auth/user.js';
import {PetQuerySchemaApiPetGetResponse} from
	'#schema/api/pet/get/response.js';
import {
	PetQuerySchemaServerDatabasePetEntry,
	type PetQuerySchemaServerDatabasePetEntryType
} from '#schema/server/database/pet/entry.js';
import {PetQuerySchemaApiServerGetResponse} from
	'#schema/api/server/get/response.js';
import {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';
import {PetQuerySchemaApiServerDeleteResponse} from
	'#schema/api/server/delete/response.js';
import {PetQuerySchemaApiConfigGetResponse} from
	'#schema/api/config/get/response.js';
import {
	PetQuerySchemaServerDatabaseConfigEntry,
	type PetQuerySchemaServerDatabaseConfigEntryType
} from '#schema/server/database/config/entry.js';

export type PetQueryClientOptions = {
	baseUrl:utf8_t;
	bearerToken?:utf8_t;
	fetch?:typeof globalThis.fetch;
};

export type PetQueryClientUserValues = {
	displayName:utf8_t;
	group:PetQuerySchemaApiAuthGroupType;
	password:utf8_t;
};

export type PetQueryClientCreateUserValues = PetQueryClientUserValues & {
	username:utf8_t;
};

type PetQueryClientCookie = {
	value:utf8_t;
	path:utf8_t;
	secure:bool_t;
	expiresAt:milliseconds_t|null;
};

const T = PetQuerySchema.type;
const envelopeValidator = PetQuerySchema.compile(T.Object({
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Unknown()
},{additionalProperties:false}));
const nullValidator = PetQuerySchema.compile(T.Null());
const userValidator = PetQuerySchema.compile(PetQuerySchemaApiAuthUser);
const managedUserValidator = PetQuerySchema.compile(
	PetQuerySchemaApiAuthManagedUser
);
const usersValidator = PetQuerySchema.compile(
	T.Array(PetQuerySchemaApiAuthManagedUser)
);

export class PetQueryClient{
	protected readonly _baseUrl:URL;
	protected readonly _fetch:typeof globalThis.fetch;
	protected readonly _abortController:AbortController;
	protected readonly _cookies:Map<utf8_t,PetQueryClientCookie>;
	protected _bearerToken:utf8_t;

	constructor(options:PetQueryClientOptions){
		this._baseUrl = new URL(options.baseUrl);
		if('http:' !== this._baseUrl.protocol
		&& 'https:' !== this._baseUrl.protocol){
			throw new Error('Client base URL must use HTTP or HTTPS');
		}
		if('' !== this._baseUrl.username || '' !== this._baseUrl.password){
			throw new Error('Client base URL must not contain credentials');
		}
		this._fetch = options.fetch ?? globalThis.fetch;
		this._abortController = new AbortController();
		this._cookies = new Map();
		this._bearerToken = options.bearerToken ?? '';
	}

	destructor():void{
		try{
			this._abortController.abort();
			this._cookies.clear();
			this._bearerToken = '';
		}
		catch(UNUSED_e){
		}
	}

	setBearerToken(token:utf8_t):void{
		this._assertNotDestroyed();
		this._bearerToken = token;
	}

	ping(signal?:AbortSignal){
		return this._request(
			'GET','/api/ping/get',
			PetQuerySchemaApiPingGetResponse.getValidator(),
			undefined,signal
		);
	}

	getAuthProviders(signal?:AbortSignal){
		return this._request(
			'GET','/auth/mode',
			PetQuerySchemaApiAuthModeGetResponse.getValidator(),
			undefined,signal
		);
	}

	getSession(signal?:AbortSignal){
		return this._request(
			'GET','/auth/session',
			PetQuerySchemaApiAuthSessionGetResponse.getValidator(),
			undefined,signal
		);
	}

	login(
		provider:utf8_t,
		username:utf8_t,
		password:utf8_t,
		signal?:AbortSignal
	){
		return this._request(
			'POST','/auth/login',
			PetQuerySchemaApiAuthLoginPostResponse.getValidator(),
			{provider,username,password},signal
		);
	}

	async loginBearer(
		provider:utf8_t,
		token:utf8_t,
		signal?:AbortSignal
	){
		const result = await this._request(
			'POST','/auth/login',
			PetQuerySchemaApiAuthLoginPostResponse.getValidator(),
			{provider},signal,token
		);
		this._assertNotDestroyed();
		this._bearerToken = token;
		return result;
	}

	async logout(signal?:AbortSignal):Promise<null>{
		const result = await this._request(
			'POST','/auth/logout',nullValidator,undefined,signal
		);
		this._bearerToken = '';
		this._cookies.clear();
		return result;
	}

	getProviderLoginUrl(provider:utf8_t):URL{
		return this._url(
			`/auth/providers/${encodeURIComponent(provider)}/login`
		);
	}

	getProviderCallbackUrl(provider:utf8_t):URL{
		return this._url(
			`/auth/providers/${encodeURIComponent(provider)}/callback`
		);
	}

	listUsers(provider?:utf8_t,signal?:AbortSignal){
		return this._request(
			'GET',this._usersPath('/auth/users',provider),
			usersValidator,undefined,signal
		);
	}

	createUser(
		values:PetQueryClientCreateUserValues,
		provider?:utf8_t,
		signal?:AbortSignal
	){
		return this._request(
			'POST','/auth/users',managedUserValidator,
			{...values,...this._providerArgs(provider)},signal
		);
	}

	updateUser(
		username:utf8_t,
		values:PetQueryClientUserValues,
		provider?:utf8_t,
		signal?:AbortSignal
	){
		return this._request(
			'PUT',`/auth/users/${encodeURIComponent(username)}`,
			managedUserValidator,
			{...values,...this._providerArgs(provider)},signal
		);
	}

	deleteUser(
		username:utf8_t,
		provider?:utf8_t,
		signal?:AbortSignal
	){
		const path = `/auth/users/${encodeURIComponent(username)}`;
		return this._request(
			'DELETE',this._usersPath(path,provider),
			nullValidator,undefined,signal
		);
	}

	listPets(signal?:AbortSignal){
		return this._request(
			'GET','/api/pets',PetQuerySchemaApiPetGetResponse.getValidator(),
			undefined,signal
		);
	}

	getPet(petId:utf8_t,signal?:AbortSignal){
		return this._request(
			'GET',`/api/pets/${encodeURIComponent(petId)}`,
			PetQuerySchemaServerDatabasePetEntry.getValidator(),
			undefined,signal
		);
	}

	createPet(
		pet:PetQuerySchemaServerDatabasePetEntryType,
		signal?:AbortSignal
	){
		return this._request(
			'POST','/api/pets',
			PetQuerySchemaServerDatabasePetEntry.getValidator(),pet,signal
		);
	}

	updatePet(
		pet:PetQuerySchemaServerDatabasePetEntryType,
		signal?:AbortSignal
	){
		return this._request(
			'PUT',`/api/pets/${encodeURIComponent(pet.petId)}`,
			PetQuerySchemaServerDatabasePetEntry.getValidator(),
			pet,signal
		);
	}

	deletePet(petId:utf8_t,signal?:AbortSignal){
		return this._request(
			'DELETE',`/api/pets/${encodeURIComponent(petId)}`,
			nullValidator,undefined,signal
		);
	}

	listServers(signal?:AbortSignal){
		return this._request(
			'GET','/api/server/get',
			PetQuerySchemaApiServerGetResponse.getValidator(),
			undefined,signal
		);
	}

	addServer(uuid:uuid_t,uri:uri_t,signal?:AbortSignal){
		return this._request(
			'PUT',`/api/server/put/${encodeURIComponent(uuid)}`,
			PetQuerySchemaApiServerPutResponse.getValidator(),
			{uri},signal
		);
	}

	deleteServer(uuid:uuid_t,signal?:AbortSignal){
		return this._request(
			'DELETE',`/api/server/delete/${encodeURIComponent(uuid)}`,
			PetQuerySchemaApiServerDeleteResponse.getValidator(),
			undefined,signal
		);
	}

	getConfig(signal?:AbortSignal){
		return this._request(
			'GET','/api/config/get',
			PetQuerySchemaApiConfigGetResponse.getValidator(),
			undefined,signal
		);
	}

	putConfig(
		config:PetQuerySchemaServerDatabaseConfigEntryType,
		signal?:AbortSignal
	){
		return this._request(
			'PUT','/api/config/put',
			PetQuerySchemaServerDatabaseConfigEntry.getValidator(),
			config,signal
		);
	}

	search(
		query:utf8_t,
		files:Array<File> = [],
		signal?:AbortSignal
	){
		const form = new FormData();
		form.set('query',query);
		for(const file of files){
			form.append('files',file,file.name);
		}
		return this._request(
			'POST','/json',PetQuerySchemaApiPetGetResponse.getValidator(),
			form,signal
		);
	}

	protected async _request<T_RESPONSE>(
		method:'GET'|'POST'|'PUT'|'DELETE',
		path:utf8_t,
		validator:PetQuerySchemaCheck<T_RESPONSE>,
		body?:unknown,
		signal?:AbortSignal,
		token:utf8_t = this._bearerToken
	):Promise<T_RESPONSE>{
		this._assertNotDestroyed();
		const url = this._url(path);
		const headers = new Headers({Accept:'application/json'});
		if('' !== token){
			headers.set('Authorization',`Bearer ${token}`);
		}
		const cookies = this._getCookies(url);
		if('' !== cookies){
			headers.set('Cookie',cookies);
		}
		const options:RequestInit = {
			method,headers,credentials:'include',redirect:'error',
			signal:undefined === signal
				? this._abortController.signal
				: AbortSignal.any([this._abortController.signal,signal])
		};
		if(undefined !== body){
			if(body instanceof FormData){
				options.body = body;
			}else{
				headers.set('Content-Type','application/json');
				options.body = JSON.stringify(body);
			}
		}
		const response = await this._fetch(url,options);
		this._assertNotDestroyed();
		this._storeCookies(response.headers,url);
		const json:unknown = await response.json();
		this._assertNotDestroyed();
		const envelope = PetQuerySchema.parse(envelopeValidator,json);
		if(!response.ok || !envelope.success){
			throw new PetQueryClientError(
				response.status,
				0 < envelope.error.length
					? envelope.error
					: [response.statusText || 'API request failed']
			);
		}
		return PetQuerySchema.parse(validator,envelope.data);
	}

	protected _url(path:utf8_t):URL{
		this._assertNotDestroyed();
		return new URL(path,this._baseUrl);
	}

	protected _usersPath(path:utf8_t,provider?:utf8_t):utf8_t{
		if(undefined === provider){
			return path;
		}
		return `${path}?provider=${encodeURIComponent(provider)}`;
	}

	protected _providerArgs(provider?:utf8_t):{provider?:utf8_t}{
		return undefined === provider ? {} : {provider};
	}

	protected _getCookies(url:URL):utf8_t{
		const values:Array<utf8_t> = [];
		for(const [name,cookie] of this._cookies){
			if(null !== cookie.expiresAt && cookie.expiresAt <= Date.now()){
				this._cookies.delete(name);
				continue;
			}
			if(cookie.secure && 'https:' !== url.protocol){
				continue;
			}
			if(url.pathname !== cookie.path
			&& !url.pathname.startsWith(
				cookie.path.endsWith('/') ? cookie.path : `${cookie.path}/`
			)){
				continue;
			}
			values.push(`${name}=${cookie.value}`);
		}
		return values.join('; ');
	}

	protected _storeCookies(headers:Headers,url:URL):void{
		for(const text of headers.getSetCookie()){
			const parts = text.split(';');
			const pair = parts.shift() ?? '';
			const separator = pair.indexOf('=');
			if(separator < 1){
				throw new Error('Invalid Set-Cookie response header');
			}
			const name = pair.slice(0,separator).trim();
			const cookie:PetQueryClientCookie = {
				value:pair.slice(separator + 1).trim(),
				path:'/',secure:false,expiresAt:null
			};
			let maxAge:float64_t|null = null;
			for(const part of parts){
				const index = part.indexOf('=');
				const key = (index < 0 ? part : part.slice(0,index));
				const value = index < 0 ? '' : part.slice(index + 1).trim();
				switch(key.trim().toLowerCase()){
					case 'secure':
						cookie.secure = true;
						break;
					case 'path':
						cookie.path = value.startsWith('/') ? value : '/';
						break;
					case 'domain':
						if(value.replace(/^\./,'').toLowerCase()
						!== url.hostname.toLowerCase()){
							throw new Error('Unexpected cookie domain');
						}
						break;
					case 'max-age':
						if(!/^-?\d+$/.test(value)){
							throw new Error('Invalid cookie Max-Age');
						}
						maxAge = Number(value);
						break;
					case 'expires':
						cookie.expiresAt = Date.parse(value);
						if(!Number.isFinite(cookie.expiresAt)){
							throw new Error('Invalid cookie expiry');
						}
						break;
				}
			}
			if(null !== maxAge){
				cookie.expiresAt = Date.now() + maxAge * 1000;
			}
			this._cookies.set(name,cookie);
		}
	}

	protected _assertNotDestroyed():void{
		if(this._abortController.signal.aborted){
			throw new Error('PetQueryClient is destroyed');
		}
	}
};
