/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClient } from '#schema/api/auth/api-client.js';
import { PetQuerySchemaApiAuthUser } from '#schema/api/auth/user.js';
import { PetQueryServerAuthPluginLdap } from '#petquery/server/auth/plugin/ldap.js';
import { PetQueryServerAuthPluginLmdb } from '#petquery/server/auth/plugin/lmdb.js';
import { PetQueryServerAuthPluginOidc } from '#petquery/server/auth/plugin/oidc.js';
import { PetQueryServerAuthSession } from '#petquery/server/auth/session.js';
import { randomBytes } from 'node:crypto';
import { randomUUID } from 'node:crypto';

import type { PetQueryConfigServerType } from '#petquery/config.js';
import type { PetQueryDatabase } from '#petquery/database.js';
import type { PetQuerySchemaApiAuthApiClientPermissionType } from '#schema/api/auth/api-client.js';
import type { PetQuerySchemaApiAuthApiClientSettingsType } from '#schema/api/auth/api-client.js';
import type { PetQuerySchemaApiAuthApiClientType } from '#schema/api/auth/api-client.js';
import type { PetQueryServerAuthPlugin } from '#petquery/server/auth/plugin.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

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
	login:'password'|'redirect';
	userManagement:bool_t;
};

export type PetQueryServerAuthApiClient =
	PetQuerySchemaApiAuthApiClientType;
export type PetQueryServerAuthApiClientSettings =
	PetQuerySchemaApiAuthApiClientSettingsType;
export type PetQueryServerAuthApiClientResult =
	'authenticated'|'unauthorized'|'forbidden';

export type PetQueryServerAuthInitialAdmin = {
	username:utf8_t;
	password:utf8_t;
};

export type PetQueryServerAuthPluginConstructor = new(
	config:PetQueryConfigServerType,
	database:PetQueryDatabase
)=>PetQueryServerAuthPlugin;

const T = PetQuerySchema.type;
const userValidator = PetQuerySchema.compile(PetQuerySchemaApiAuthUser);
const providerValidator = PetQuerySchema.compile(T.String({minLength:1}));
const apiClientValidator = PetQuerySchema.compile(
	PetQuerySchemaApiAuthApiClient
);
const apiClientTokenValidator = PetQuerySchema.compile(
	T.String({pattern:'^[\\x21-\\x7e]{16,256}$'})
);
const apiClientKeyPrefix = 'api-client:token:';

export class PetQueryServerAuth{
	protected static readonly _registry:
		Map<utf8_t,PetQueryServerAuthPluginConstructor> = new Map<
			utf8_t,PetQueryServerAuthPluginConstructor
		>([
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
	protected _initialSetupInProgress:bool_t;

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
		this._initialSetupInProgress = false;
		const configuredProviders = config.authenticate.providers
			?? [config.authenticate.mode];
		const providers:Array<utf8_t> = [];
		for(const name of configuredProviders){
			if(PetQueryServerAuth._isInteractiveProvider(name)
			&& !providers.includes(name)){
				providers.push(name);
			}
		}
		this._providers = providers;
		if(0 === this._providers.length){
			throw new Error(
				'Enable a password or redirect provider; bearer clients '
				+'cannot sign in to the admin GUI'
			);
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
		const mode = this._config.authenticate.mode;
		if('bearer' !== mode){
			return mode;
		}
		const provider = this._providers[0];
		if(undefined === provider){
			throw new Error('No interactive authentication provider enabled');
		}
		return provider;
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

	async _isInitialSetupRequired():Promise<bool_t>{
		this._assertNotDestroyed();
		if(1 !== this._providers.length || 'lmdb' !== this._providers[0]){
			return false;
		}
		const plugin = this._getPlugin('lmdb');
		return plugin._isInitialSetupRequired();
	}

	async _createInitialAdmin(
		values:PetQueryServerAuthInitialAdmin,
		res:PetQueryServerResponse
	):Promise<void>{
		this._assertNotDestroyed();
		if(this._initialSetupInProgress){
			throw new Error('Initial admin setup is already in progress');
		}
		this._initialSetupInProgress = true;
		try{
			if(!await this._isInitialSetupRequired()){
				throw new Error('Initial admin setup is already complete');
			}
			const plugin = this._getPlugin('lmdb');
			const user = await plugin._createInitialAdmin({
				username:values.username,
				displayName:values.username,
				group:'admin',
				password:values.password
			});
			this._assertNotDestroyed();
			await this._sessions.create(user,res);
		}
		finally{
			this._initialSetupInProgress = false;
		}
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

	async _listApiClients():Promise<Array<PetQueryServerAuthApiClient>>{
		this._assertNotDestroyed();
		const database = this._database.getDbAuth();
		const entries = await database.serverAuthGetEntries();
		this._assertNotDestroyed();
		const clients:Array<PetQueryServerAuthApiClient> = [];
		for(const [key,value] of entries){
			if(key.startsWith(apiClientKeyPrefix)){
				clients.push(this._parseApiClient(value));
			}
		}
		clients.sort(this._compareApiClients.bind(this));
		return clients;
	}

	async _createApiClient(
		values:PetQueryServerAuthApiClientSettings
	):Promise<{
		client:PetQueryServerAuthApiClient;
		token:utf8_t;
	}>{
		this._assertNotDestroyed();
		const settings = this._validateApiClientSettings(values);
		const tokenBytes = randomBytes(32);
		const token = tokenBytes.toString('base64url');
		const hash = createHash('sha256');
		hash.update(token);
		const digest = hash.digest('hex');
		const key = `${apiClientKeyPrefix}${digest}`;
		const currentDate = new Date();
		const now = currentDate.toISOString();
		const client:PetQueryServerAuthApiClient = {
			...settings,
			id:randomUUID(),
			createdAt:now,
			updatedAt:now
		};
		const database = this._database.getDbAuth();
		await database.serverAuthPut(key,JSON.stringify(client));
		this._assertNotDestroyed();
		return {client,token};
	}

	async _updateApiClient(
		id:utf8_t,
		values:PetQueryServerAuthApiClientSettings
	):Promise<PetQueryServerAuthApiClient>{
		this._assertNotDestroyed();
		const existing = await this._findApiClientById(id);
		this._assertNotDestroyed();
		if(null === existing){
			throw new Error(`API client "${id}" does not exist`);
		}
		const currentDate = new Date();
		const updatedAt = currentDate.toISOString();
		const client:PetQueryServerAuthApiClient = {
			...existing.client,
			...this._validateApiClientSettings(values),
			updatedAt
		};
		const database = this._database.getDbAuth();
		await database.serverAuthPut(
			existing.key,
			JSON.stringify(client)
		);
		this._assertNotDestroyed();
		return client;
	}

	async _deleteApiClient(id:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		const existing = await this._findApiClientById(id);
		this._assertNotDestroyed();
		if(null === existing){
			throw new Error(`API client "${id}" does not exist`);
		}
		const database = this._database.getDbAuth();
		await database.serverAuthRemove(existing.key);
		this._assertNotDestroyed();
	}

	async _authenticateApiClient(
		req:PetQueryServerRequest,
		permission:PetQuerySchemaApiAuthApiClientPermissionType
	):Promise<PetQueryServerAuthApiClientResult>{
		this._assertNotDestroyed();
		const token = this._getBearerToken(req);
		if(null === token){
			return 'unauthorized';
		}
		const hash = createHash('sha256');
		hash.update(token);
		const digest = hash.digest('hex');
		const database = this._database.getDbAuth();
		const text = await database.serverAuthGet(
			`${apiClientKeyPrefix}${digest}`
		);
		this._assertNotDestroyed();
		if(undefined === text){
			return 'unauthorized';
		}
		const client = this._parseApiClient(text);
		const requestIp = this._normalizeIp(req.ip);
		if(!this._hasAllowedIp(client.allowedIps,requestIp)){
			return 'forbidden';
		}
		if(!client.permissions.includes('*')
		&& !client.permissions.includes(permission)){
			return 'forbidden';
		}
		return 'authenticated';
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

	protected _compareApiClients(
		left:PetQueryServerAuthApiClient,
		right:PetQueryServerAuthApiClient
	):int_t{
		return left.name.localeCompare(right.name);
	}

	protected _hasAllowedIp(
		allowedIps:Array<utf8_t>,
		requestIp:utf8_t
	):bool_t{
		if(allowedIps.includes('*')){
			return true;
		}
		for(const ip of allowedIps){
			if(requestIp === this._normalizeIp(ip)){
				return true;
			}
		}
		return false;
	}

	protected async _findApiClientById(
		id:utf8_t
	):Promise<{
		key:utf8_t;
		client:PetQueryServerAuthApiClient;
	}|null>{
		const database = this._database.getDbAuth();
		const entries = await database.serverAuthGetEntries();
		this._assertNotDestroyed();
		for(const [key,value] of entries){
			if(!key.startsWith(apiClientKeyPrefix)){
				continue;
			}
			const client = this._parseApiClient(value);
			if(id === client.id){
				return {key,client};
			}
		}
		return null;
	}

	protected _getBearerToken(
		req:PetQueryServerRequest
	):utf8_t|null{
		const header = req.headers.authorization;
		if('string' !== typeof header){
			return null;
		}
		const trimmedHeader = header.trim();
		const parts = trimmedHeader.split(/\s+/);
		const scheme = parts[0]?.toLowerCase();
		if(2 !== parts.length
		|| 'bearer' !== scheme){
			return null;
		}
		const token = parts[1];
		if(undefined === token
		|| !apiClientTokenValidator.Check(token)){
			return null;
		}
		return token;
	}

	protected _normalizeIp(value:utf8_t):utf8_t{
		const ip = value.toLowerCase();
		return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
	}

	protected _parseApiClient(
		value:utf8_t
	):PetQueryServerAuthApiClient{
		const client = PetQuerySchema.parse(
			apiClientValidator,
			JSON.parse(value)
		);
		return {
			...client,
			...this._validateApiClientSettings({
				name:client.name,
				allowedIps:client.allowedIps,
				permissions:client.permissions
			})
		};
	}

	protected _validateApiClientSettings(
		values:PetQueryServerAuthApiClientSettings
	):PetQueryServerAuthApiClientSettings{
		const name = values.name.trim();
		if('' === name){
			throw new Error('API client name is required');
		}
		const allowedIps:Array<utf8_t> = [];
		for(const value of values.allowedIps){
			const trimmedValue = value.trim();
			const ip = this._normalizeIp(trimmedValue);
			if(!allowedIps.includes(ip)){
				allowedIps.push(ip);
			}
			if('*' !== ip && 0 === isIP(ip)){
				throw new Error('Allowed IPs must be valid IP addresses or *');
			}
		}
		if(allowedIps.includes('*') && 1 !== allowedIps.length){
			throw new Error('Wildcard IP cannot be combined with IP addresses');
		}
		const permissions = values.permissions;
		if(permissions.includes('*') && 1 !== permissions.length){
			throw new Error(
				'Wildcard permission cannot be combined with API permissions'
			);
		}
		return {name,allowedIps,permissions};
	}

	protected static _isInteractiveProvider(name:utf8_t):bool_t{
		return 'bearer' !== name;
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
