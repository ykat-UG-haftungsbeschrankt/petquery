/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryDatabase} from '#petquery/database.js';
import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQueryServerRequest} from '#petquery/server/request.js';
import type {PetQueryServerResponse} from '#petquery/server/response.js';
import type {PetQueryServerAuthPlugin} from
	'#petquery/server/auth/plugin.js';
import {PetQueryServerAuthPluginBearer} from
	'#petquery/server/auth/plugin/bearer.js';
import {PetQueryServerAuthPluginLmdb} from
	'#petquery/server/auth/plugin/lmdb.js';
import {PetQueryServerAuthPluginLdap} from
	'#petquery/server/auth/plugin/ldap.js';
import {PetQueryServerAuthPluginOidc} from
	'#petquery/server/auth/plugin/oidc.js';
import {PetQueryServerAuthSession} from '#petquery/server/auth/session.js';
import {PetQuerySchemaApiAuthUser} from '#schema/api/auth/user.js';

export type PetQueryServerAuthMode = utf8_t;
export type PetQueryServerAuthGroup = 'admin'|'user';

export type PetQueryServerAuthUser = {
	username:utf8_t;
	displayName:utf8_t;
	group:PetQueryServerAuthGroup;
	provider:utf8_t;
};

export type PetQueryServerAuthManagedUser = PetQueryServerAuthUser & {
	createdAt:utf8_t;
};

export type PetQueryServerAuthCreateUser = {
	username:utf8_t;
	displayName:utf8_t;
	group:PetQueryServerAuthGroup;
	password:utf8_t;
};

export type PetQueryServerAuthUpdateUser = {
	displayName:utf8_t;
	group:PetQueryServerAuthGroup;
	password:utf8_t;
};

export type PetQueryServerAuthProvider = {
	name:utf8_t;
	login:'bearer'|'password'|'redirect';
	userManagement:bool_t;
};

export type PetQueryServerAuthPluginConstructor = new(
	config:PetQueryConfigServerType,
	database:PetQueryDatabase
)=>PetQueryServerAuthPlugin;

const T = PetQuerySchema.type;
const userValidator = PetQuerySchema.compile(PetQuerySchemaApiAuthUser);
const providerValidator = PetQuerySchema.compile(T.String({minLength:1}));

export class PetQueryServerAuth{
	protected static readonly _registry:
		Map<utf8_t,PetQueryServerAuthPluginConstructor> = new Map<
			utf8_t,PetQueryServerAuthPluginConstructor
		>([
			['bearer',PetQueryServerAuthPluginBearer],
			['lmdb',PetQueryServerAuthPluginLmdb],
			['ldap',PetQueryServerAuthPluginLdap],
			['oidc',PetQueryServerAuthPluginOidc]
		]);

	protected readonly _config:PetQueryConfigServerType;
	protected readonly _database:PetQueryDatabase;
	protected readonly _sessions:PetQueryServerAuthSession;
	protected readonly _providers:Array<utf8_t>;
	protected readonly _plugins:Map<utf8_t,PetQueryServerAuthPlugin>;
	protected _destroyed:bool_t;
	protected _destructorPromise:Promise<void>|null;

	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase
	){
		this._config = config;
		this._database = database;
		this._sessions = new PetQueryServerAuthSession(config,database);
		this._plugins = new Map();
		this._destroyed = false;
		this._destructorPromise = null;
		this._providers = Array.from(new Set(
			config.authenticate.providers
			?? [config.authenticate.mode,'bearer']
		));
		if(0 === this._providers.length){
			throw new Error('At least one authentication provider is required');
		}
		for(const name of this._providers){
			if(!PetQueryServerAuth._registry.has(name)){
				throw new Error(`Unknown authentication provider "${name}"`);
			}
		}
	}

	static registerPlugin(
		name:utf8_t,
		plugin:PetQueryServerAuthPluginConstructor
	):void{
		PetQuerySchema.parse(providerValidator,name);
		if(this._registry.has(name)){
			throw new Error(`Authentication provider "${name}" is registered`);
		}
		this._registry.set(name,plugin);
	}

	destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destroyed = true;
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
		try{
			this._sessions.destructor();
			const cleanups:Array<Promise<void>> = [];
			for(const plugin of this._plugins.values()){
				cleanups.push(plugin.destructor());
			}
			this._plugins.clear();
			await Promise.allSettled(cleanups);
		}
		catch(UNUSED_e){
		}
	}

	getMode():PetQueryServerAuthMode{
		return this._config.authenticate.mode;
	}

	getProviders():Array<PetQueryServerAuthProvider>{
		const providers:Array<PetQueryServerAuthProvider> = [];
		for(const name of this._providers){
			const plugin = this._getPlugin(name);
			providers.push({
				name,
				login:plugin.getLoginType(),
				userManagement:plugin.supportsUserManagement()
			});
		}
		return providers;
	}

	async authenticate(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		this._assertNotDestroyed();
		const session = await this._sessions.getUser(req);
		this._assertNotDestroyed();
		if(null !== session && this._providers.includes(session.provider)){
			return session;
		}
		let user:PetQueryServerAuthUser|null = null;
		for(const name of this._providers){
			const candidate = await this._getPlugin(name).authenticate(req);
			this._assertNotDestroyed();
			if(null !== candidate){
				if(null !== user){
					throw new Error('Multiple providers accepted the request');
				}
				user = this._parseUser(candidate,name);
			}
		}
		return user;
	}

	async createLoginSession(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const provider = this._getRequestedProvider(req);
		const user = this._parseUser(
			await this._getPlugin(provider).login(req),
			provider
		);
		this._assertNotDestroyed();
		await this._sessions.create(user,res);
		return user;
	}

	async logout(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._assertNotDestroyed();
		await this._sessions.logout(req,res);
	}

	async listUsers(
		provider?:utf8_t
	):Promise<Array<PetQueryServerAuthManagedUser>>{
		if(undefined !== provider){
			const plugin = this._getPlugin(provider);
			if(plugin.supportsUserManagement()){
				return plugin.listUsers();
			}
			return this._sessions.listUsers(provider);
		}
		const users:Array<PetQueryServerAuthManagedUser> = [];
		for(const name of this._providers){
			users.push(...await this.listUsers(name));
		}
		return users;
	}

	async createUser(
		values:PetQueryServerAuthCreateUser,
		provider?:utf8_t
	):Promise<PetQueryServerAuthManagedUser>{
		return this._getUserManager(provider).createUser(values);
	}

	async updateUser(
		username:utf8_t,
		values:PetQueryServerAuthUpdateUser,
		provider?:utf8_t
	):Promise<PetQueryServerAuthManagedUser>{
		return this._getUserManager(provider).updateUser(username,values);
	}

	async deleteUser(username:utf8_t,provider?:utf8_t):Promise<void>{
		await this._getUserManager(provider).deleteUser(username);
	}

	hasProvider(name:utf8_t):bool_t{
		this._assertNotDestroyed();
		return this._providers.includes(name);
	}

	canManageUsers(provider?:utf8_t):bool_t{
		if(undefined !== provider){
			return this._getPlugin(provider).supportsUserManagement();
		}
		return 1 === this.getProviders().filter(
			PetQueryServerAuth._isUserManager
		).length;
	}

	getLoginUrl(provider:utf8_t):Promise<URL>{
		return this._getPlugin(provider).getLoginUrl();
	}

	async handleCallback(
		provider:utf8_t,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const user = this._parseUser(
			await this._getPlugin(provider).handleCallback(req),
			provider
		);
		this._assertNotDestroyed();
		await this._sessions.create(user,res);
		return user;
	}

	getOidcLoginUrl():Promise<URL>{
		return this.getLoginUrl('oidc');
	}

	handleOidcCallback(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		return this.handleCallback('oidc',req,res);
	}

	protected _getPlugin(name:utf8_t):PetQueryServerAuthPlugin{
		this._assertNotDestroyed();
		if(!this._providers.includes(name)){
			throw new Error(`Authentication provider "${name}" is not enabled`);
		}
		const existing = this._plugins.get(name);
		if(undefined !== existing){
			if(name !== existing.getName()){
				throw new Error('Authentication provider has wrong name');
			}
			return existing;
		}
		const Plugin = PetQueryServerAuth._registry.get(name);
		if(undefined === Plugin){
			throw new Error(`Unknown authentication provider "${name}"`);
		}
		const plugin = new Plugin(this._config,this._database);
		this._plugins.set(name,plugin);
		if(name !== plugin.getName()){
			throw new Error(`Authentication provider "${name}" has wrong name`);
		}
		return plugin;
	}

	protected _getUserManager(provider?:utf8_t):PetQueryServerAuthPlugin{
		let name = provider;
		if(undefined === name){
			const managers = this.getProviders().filter(
				PetQueryServerAuth._isUserManager
			);
			if(1 !== managers.length){
				throw new Error('Select a user management provider');
			}
			name = managers[0].name;
		}
		const plugin = this._getPlugin(name);
		if(!plugin.supportsUserManagement()){
			throw new Error('User management is read-only for this provider');
		}
		return plugin;
	}

	protected static _isUserManager(
		provider:PetQueryServerAuthProvider
	):bool_t{
		return provider.userManagement;
	}

	protected _getRequestedProvider(req:PetQueryServerRequest):utf8_t{
		const args = req.getHandlerArgs();
		if('object' !== typeof args || null === args
		|| Array.isArray(args)){
			throw new Error('Authentication provider is required');
		}
		return PetQuerySchema.parse(providerValidator,args.provider);
	}

	protected _parseUser(
		value:unknown,
		provider:utf8_t
	):PetQueryServerAuthUser{
		const user = PetQuerySchema.parse(
			userValidator,
			value
		);
		if(provider !== user.provider){
			throw new Error('Authentication plugin returned a different provider');
		}
		return user;
	}

	protected _assertNotDestroyed():void{
		if(this._destroyed){
			throw new Error('Authentication is destroyed');
		}
	}
};
