/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import crypto from 'node:crypto';
import {promisify} from 'node:util';
import type {
	AuthorizationCodeGrantChecks,
	Configuration
} from 'openid-client';
import * as oidc from 'openid-client';
import {Client as LdapClient} from 'ldapts';
import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryServerDatabase} from '#petquery/server/database.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export type PetQueryServerAuthMode = 'bearer'|'lmdb'|'ldap'|'oidc';
export type PetQueryServerAuthGroup = 'admin'|'user';

export type PetQueryServerAuthUser = {
	username:utf8_t;
	displayName:utf8_t;
	group:PetQueryServerAuthGroup;
	provider:PetQueryServerAuthMode;
};

export type PetQueryServerAuthManagedUser = PetQueryServerAuthUser & {
	createdAt:utf8_t;
};

type PetQueryServerAuthSession = PetQueryServerAuthUser & {
	sessionId:utf8_t;
	createdAt:uint_t;
	expiresAt:uint_t;
};

type PetQueryServerAuthLocalUser = PetQueryServerAuthManagedUser & {
	passwordHash:utf8_t;
	updatedAt:utf8_t;
};

type PetQueryServerAuthOidcPending = {
	state:utf8_t;
	nonce:utf8_t;
	codeVerifier:utf8_t;
	expiresAt:uint_t;
};

const T = PetQuerySchema.type;
const scrypt = promisify(crypto.scrypt);

const userGroupSchema = T.Union([
	T.Literal('admin'),
	T.Literal('user')
]);

const authModeSchema = T.Union([
	T.Literal('bearer'),
	T.Literal('lmdb'),
	T.Literal('ldap'),
	T.Literal('oidc')
]);

const localUserSchema = T.Object({
	username:T.String({minLength:1,maxLength:128}),
	displayName:T.String({maxLength:256}),
	group:userGroupSchema,
	provider:T.Literal('lmdb'),
	passwordHash:T.String({minLength:1}),
	createdAt:T.String({minLength:1}),
	updatedAt:T.String({minLength:1})
},{additionalProperties:false});

const sessionSchema = T.Object({
	sessionId:T.String({minLength:1}),
	username:T.String({minLength:1,maxLength:128}),
	displayName:T.String({maxLength:256}),
	group:userGroupSchema,
	provider:authModeSchema,
	createdAt:T.Integer({minimum:0}),
	expiresAt:T.Integer({minimum:0})
},{additionalProperties:false});

const oidcPendingSchema = T.Object({
	state:T.String({minLength:1}),
	nonce:T.String({minLength:1}),
	codeVerifier:T.String({minLength:1}),
	expiresAt:T.Integer({minimum:0})
},{additionalProperties:false});

const localUserValidator = PetQuerySchema.compile(localUserSchema);
const sessionValidator = PetQuerySchema.compile(sessionSchema);
const oidcPendingValidator = PetQuerySchema.compile(oidcPendingSchema);

export class PetQueryServerAuth{
	protected readonly _config:PetQueryConfigServerType;
	// Borrowed; its owner closes it.
	protected readonly _users:PetQueryServerDatabase;
	// Borrowed; its owner closes it.
	protected readonly _sessions:PetQueryServerDatabase;
	protected _oidcConfig:Promise<Configuration>|null;

	constructor(
		config:PetQueryConfigServerType,
		users:PetQueryServerDatabase,
		sessions:PetQueryServerDatabase
	){
		this._config = config;
		this._users = users;
		this._sessions = sessions;
		this._oidcConfig = null;
	}

	destructor():void{
		try{
			this._oidcConfig = null;
		}
		catch(UNUSED_e){
		}
	}

	getMode():PetQueryServerAuthMode{
		return this._config.authenticate.mode;
	}

	async authenticate(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		const session = await this._getSessionUser(req);
		if(null !== session){
			return session;
		}
		return this._getBearerUser(req);
	}

	async createLoginSession(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const mode = this.getMode();
		if('bearer' === mode){
			const user = this._getBearerUser(req);
			if(null === user){
				throw new Error('Invalid bearer token');
			}
			await this._createSession(user,res);
			return user;
		}
		if('lmdb' === mode){
			return this._loginLocal(req,res);
		}
		if('ldap' === mode){
			return this._loginLdap(req,res);
		}
		throw new Error('Use /auth/oidc/login for OpenID Connect');
	}

	async logout(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const sessionId = this._getCookie(req);
		if(null !== sessionId){
			await this._sessions.remove(this._getSessionKey(sessionId));
		}
		res.clearCookie(this._config.authenticate.session.cookie_name,{
			httpOnly:true,
			secure:this._config.authenticate.session.secure,
			sameSite:'lax',
			path:'/'
		});
	}

	async listUsers():Promise<Array<PetQueryServerAuthManagedUser>>{
		if('lmdb' !== this.getMode()
		&& 'bearer' !== this.getMode()){
			return this._listSessionUsers();
		}
		const entries = await this._users.getEntries();
		const ret:Array<PetQueryServerAuthManagedUser> = [];
		for(const [key,value] of entries){
			if(!key.startsWith('user:')){
				continue;
			}
			const user = this._parseLocalUser(value);
			ret.push(this._toManagedUser(user));
		}
		ret.sort((a,b)=>a.username.localeCompare(b.username));
		return ret;
	}

	protected async _listSessionUsers():
		Promise<Array<PetQueryServerAuthManagedUser>>{
		const entries = await this._sessions.getEntries();
		const seen = new Set<utf8_t>();
		const ret:Array<PetQueryServerAuthManagedUser> = [];
		for(const [key,value] of entries){
			if(!key.startsWith('session:')){
				continue;
			}
			const session = this._parseSession(value);
			if(seen.has(session.username)){
				continue;
			}
			seen.add(session.username);
			ret.push({
				username:session.username,
				displayName:session.displayName,
				group:session.group,
				provider:session.provider,
				createdAt:new Date(session.createdAt).toISOString()
			});
		}
		ret.sort((a,b)=>a.username.localeCompare(b.username));
		return ret;
	}

	async createUser(values:{
		username:utf8_t;
		displayName:utf8_t;
		group:PetQueryServerAuthGroup;
		password:utf8_t;
	}):Promise<PetQueryServerAuthManagedUser>{
		this._assertLocalUsersWritable();
		this._validateUserInput(values.username,values.password);
		if(undefined !== await this._users.get(this._getUserKey(
			values.username
		))){
			throw new Error(`User "${values.username}" already exists`);
		}
		const now = new Date().toISOString();
		const user:PetQueryServerAuthLocalUser = {
			username:values.username,
			displayName:values.displayName,
			group:values.group,
			provider:'lmdb',
			passwordHash:await this._hashPassword(values.password),
			createdAt:now,
			updatedAt:now
		};
		await this._users.put(
			this._getUserKey(values.username),
			JSON.stringify(user)
		);
		return this._toManagedUser(user);
	}

	async updateUser(
		username:utf8_t,
		values:{
			displayName:utf8_t;
			group:PetQueryServerAuthGroup;
			password:utf8_t;
		}
	):Promise<PetQueryServerAuthManagedUser>{
		this._assertLocalUsersWritable();
		this._validateUserInput(username,null);
		const existing = await this._getLocalUser(username);
		if(null === existing){
			throw new Error(`User "${username}" does not exist`);
		}
		const user:PetQueryServerAuthLocalUser = {
			...existing,
			displayName:values.displayName,
			group:values.group,
			updatedAt:new Date().toISOString()
		};
		if('' !== values.password){
			this._validateUserInput(username,values.password);
			user.passwordHash = await this._hashPassword(values.password);
		}
		await this._users.put(this._getUserKey(username),JSON.stringify(user));
		return this._toManagedUser(user);
	}

	async deleteUser(username:utf8_t):Promise<void>{
		this._assertLocalUsersWritable();
		this._validateUserInput(username,null);
		await this._users.remove(this._getUserKey(username));
	}

	async getOidcLoginUrl():Promise<URL>{
		const config = this._config.authenticate.oidc;
		const state = oidc.randomState();
		const nonce = oidc.randomNonce();
		const codeVerifier = oidc.randomPKCECodeVerifier();
		const challenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
		const pending:PetQueryServerAuthOidcPending = {
			state,
			nonce,
			codeVerifier,
			expiresAt:Date.now() + 10 * 60 * 1000
		};

		await this._sessions.put(
			this._getOidcKey(state),
			JSON.stringify(pending)
		);
		return oidc.buildAuthorizationUrl(await this._getOidcConfig(),{
			redirect_uri:config.redirect_uri,
			scope:config.scopes,
			state,
			nonce,
			code_challenge:challenge,
			code_challenge_method:'S256'
		});
	}

	async handleOidcCallback(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const state = this._getQueryString(req.query.state,'state');
		const text = await this._sessions.get(this._getOidcKey(state));
		if(undefined === text){
			throw new Error('OIDC state is invalid or expired');
		}
		const pending = this._parseOidcPending(text);
		if(Date.now() > pending.expiresAt){
			await this._sessions.remove(this._getOidcKey(state));
			throw new Error('OIDC state has expired');
		}
		const checks:AuthorizationCodeGrantChecks = {
			expectedState:state,
			expectedNonce:pending.nonce,
			pkceCodeVerifier:pending.codeVerifier
		};
		const tokens = await oidc.authorizationCodeGrant(
			await this._getOidcConfig(),
			this._getOidcCallbackUrl(req),
			checks
		);
		await this._sessions.remove(this._getOidcKey(state));
		const claims = tokens.claims() ?? {};
		const user = await this._getOidcUser(tokens.access_token,claims);
		await this._createSession(user,res);
		return user;
	}

	protected async _getSessionUser(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		const sessionId = this._getCookie(req);
		if(null === sessionId){
			return null;
		}
		const text = await this._sessions.get(this._getSessionKey(sessionId));
		if(undefined === text){
			return null;
		}
		const session = this._parseSession(text);
		if(Date.now() > session.expiresAt){
			await this._sessions.remove(this._getSessionKey(sessionId));
			return null;
		}
		return {
			username:session.username,
			displayName:session.displayName,
			group:session.group,
			provider:session.provider
		};
	}

	protected _getBearerUser(
		req:PetQueryServerRequest
	):PetQueryServerAuthUser|null{
		const token = this._getBearerToken(req);
		if(null === token || !this._config.authenticate.bearer.has(token)){
			return null;
		}
		return {
			username:'bearer',
			displayName:'******',
			group:'admin',
			provider:'bearer'
		};
	}

	protected async _loginLocal(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const body = this._getPasswordLogin(req);
		const user = await this._getLocalUser(body.username);
		if(null === user
		|| !await this._verifyPassword(body.password,user.passwordHash)){
			throw new Error('Invalid username or password');
		}
		const authUser = this._toAuthUser(user);
		await this._createSession(authUser,res);
		return authUser;
	}

	protected async _loginLdap(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQueryServerAuthUser>{
		const body = this._getPasswordLogin(req);
		const config = this._config.authenticate.ldap;
		if('' === config.url || '' === config.base_dn){
			throw new Error('LDAP authentication is not configured');
		}
		const client = new LdapClient({
			url:config.url,
			timeout:10000,
			connectTimeout:10000
		});
		try{
			if('' !== config.bind_dn){
				await client.bind(config.bind_dn,config.bind_password);
			}
			const result = await client.search(config.base_dn,{
				scope:'sub',
				filter:this._getLdapFilter(
					config.user_filter,
					body.username
				),
				sizeLimit:2,
				attributes:[
					'cn',
					'displayName',
					'mail',
					'memberOf',
					'groups'
				]
			});
			if(1 !== result.searchEntries.length){
				throw new Error('Invalid username or password');
			}
			const entry = result.searchEntries[0];
			await client.bind(entry.dn,body.password);
			const user = this._getLdapUser(body.username,entry);
			await this._createSession(user,res);
			return user;
		}
		finally{
			await this._unbind(client);
		}
	}

	protected async _createSession(
		user:PetQueryServerAuthUser,
		res:PetQueryServerResponse
	):Promise<void>{
		const sessionId = crypto.randomBytes(32).toString('base64url');
		const now = Date.now();
		const maxAge = this._config.authenticate.session.max_age;
		const session:PetQueryServerAuthSession = {
			...user,
			sessionId,
			createdAt:now,
			expiresAt:now + maxAge
		};
		await this._sessions.put(
			this._getSessionKey(sessionId),
			JSON.stringify(session)
		);
		res.cookie(this._config.authenticate.session.cookie_name,sessionId,{
			httpOnly:true,
			secure:this._config.authenticate.session.secure,
			sameSite:'lax',
			maxAge,
			path:'/'
		});
	}

	protected async _getLocalUser(
		username:utf8_t
	):Promise<PetQueryServerAuthLocalUser|null>{
		const text = await this._users.get(this._getUserKey(username));
		return undefined === text ? null : this._parseLocalUser(text);
	}

	protected async _hashPassword(password:utf8_t):Promise<utf8_t>{
		const salt = crypto.randomBytes(16).toString('base64url');
		const hash = await scrypt(password,salt,64);
		if(!(hash instanceof Buffer)){
			throw new Error('Password hash failed');
		}
		return `scrypt:${salt}:${hash.toString('base64url')}`;
	}

	protected async _verifyPassword(
		password:utf8_t,
		stored:utf8_t
	):Promise<bool_t>{
		const parts = stored.split(':');
		if(3 !== parts.length || 'scrypt' !== parts[0]){
			return false;
		}
		const expected = Buffer.from(parts[2],'base64url');
		const actual = await scrypt(password,parts[1],expected.length);
		if(!(actual instanceof Buffer) || actual.length !== expected.length){
			return false;
		}
		return crypto.timingSafeEqual(actual,expected);
	}

	protected _parseLocalUser(text:utf8_t):PetQueryServerAuthLocalUser{
		return PetQuerySchema.parse(
			localUserValidator,
			JSON.parse(text)
		);
	}

	protected _parseSession(text:utf8_t):PetQueryServerAuthSession{
		return PetQuerySchema.parse(sessionValidator,JSON.parse(text));
	}

	protected _parseOidcPending(text:utf8_t):PetQueryServerAuthOidcPending{
		return PetQuerySchema.parse(oidcPendingValidator,JSON.parse(text));
	}

	protected _toAuthUser(
		user:PetQueryServerAuthLocalUser
	):PetQueryServerAuthUser{
		return {
			username:user.username,
			displayName:user.displayName,
			group:user.group,
			provider:user.provider
		};
	}

	protected _toManagedUser(
		user:PetQueryServerAuthLocalUser
	):PetQueryServerAuthManagedUser{
		return {
			...this._toAuthUser(user),
			createdAt:user.createdAt
		};
	}

	protected _getPasswordLogin(req:PetQueryServerRequest):{
		username:utf8_t;
		password:utf8_t;
	}{
		const body = req.body;
		if('object' !== typeof body || null === body || Array.isArray(body)
		|| !('username' in body) || !('password' in body)
		|| 'string' !== typeof body.username
		|| 'string' !== typeof body.password){
			throw new Error('username and password are required');
		}
		this._validateUserInput(body.username,body.password);
		return {
			username:body.username,
			password:body.password
		};
	}

	protected _validateUserInput(
		username:utf8_t,
		password:utf8_t|null
	):void{
		if(!/^[A-Za-z0-9_.@-]{1,128}$/.test(username)){
			throw new Error('Invalid username');
		}
		if(null !== password
		&& (8 > password.length || 1024 < password.length)){
			throw new Error('Invalid password length');
		}
	}

	protected _assertLocalUsersWritable():void{
		if('lmdb' !== this.getMode()
		&& 'bearer' !== this.getMode()){
			throw new Error('User management is read-only for this provider');
		}
	}

	protected _getBearerToken(req:PetQueryServerRequest):utf8_t|null{
		const header = req.headers.authorization;
		if('string' !== typeof header){
			return null;
		}
		const parts = header.split(' ');
		if(2 !== parts.length || 'bearer' !== parts[0].toLowerCase()){
			return null;
		}
		return parts[1];
	}

	protected _getCookie(req:PetQueryServerRequest):utf8_t|null{
		const header = req.headers.cookie;
		if('string' !== typeof header){
			return null;
		}
		const name = this._config.authenticate.session.cookie_name;
		for(const item of header.split(';')){
			const index = item.indexOf('=');
			if(0 > index){
				continue;
			}
			const key = item.slice(0,index).trim();
			if(name === key){
				return decodeURIComponent(item.slice(index + 1));
			}
		}
		return null;
	}

	protected _getUserKey(username:utf8_t):utf8_t{
		return `user:${username}`;
	}

	protected _getSessionKey(sessionId:utf8_t):utf8_t{
		return `session:${sessionId}`;
	}

	protected _getOidcKey(state:utf8_t):utf8_t{
		return `oidc:${state}`;
	}

	protected _getLdapFilter(template:utf8_t,username:utf8_t):utf8_t{
		const value = this._escapeLdapFilterValue(username);
		const filter = '' === template ? '(uid={{username}})' : template;
		return filter.split('{{username}}').join(value);
	}

	protected _escapeLdapFilterValue(value:utf8_t):utf8_t{
		return value
			.replaceAll('\\','\\5c')
			.replaceAll('*','\\2a')
			.replaceAll('(','\\28')
			.replaceAll(')','\\29')
			.replaceAll('\u0000','\\00');
	}

	protected _getLdapUser(
		username:utf8_t,
		entry:{[index:string]:Buffer|Buffer[]|string[]|string}
	):PetQueryServerAuthUser{
		const displayName = this._getFirstString(
			entry.displayName,
			this._getFirstString(entry.cn,username)
		);
		return {
			username,
			displayName,
			group:this._hasAdminGroup(entry) ? 'admin' : 'user',
			provider:'ldap'
		};
	}

	protected _hasAdminGroup(
		entry:{[index:string]:Buffer|Buffer[]|string[]|string}
	):bool_t{
		const adminGroup = this._config.authenticate.ldap.admin_group;
		if('' === adminGroup){
			return false;
		}
		const values = [
			...this._getStringArray(entry.memberOf),
			...this._getStringArray(entry.groups)
		];
		for(const value of values){
			if(adminGroup === value
			|| value.toLowerCase().includes(
				`cn=${adminGroup.toLowerCase()},`
			)){
				return true;
			}
		}
		return false;
	}

	protected async _getOidcConfig():Promise<Configuration>{
		if(null === this._oidcConfig){
			const config = this._config.authenticate.oidc;
			if('' === config.issuer
			|| '' === config.client_id
			|| '' === config.redirect_uri){
				throw new Error('OpenID Connect is not configured');
			}
			this._oidcConfig = oidc.discovery(
				new URL(config.issuer),
				config.client_id,
				{
					client_secret:config.client_secret,
					redirect_uris:[config.redirect_uri],
					response_types:['code']
				},
				oidc.ClientSecretPost(config.client_secret)
			);
		}
		return this._oidcConfig;
	}

	protected _getOidcCallbackUrl(req:PetQueryServerRequest):URL{
		const configured = new URL(
			this._config.authenticate.oidc.redirect_uri
		);
		const query = req.originalUrl.split('?')[1] ?? '';
		configured.search = query;
		return configured;
	}

	protected async _getOidcUser(
		accessToken:utf8_t|undefined,
		claims:Record<string,unknown>
	):Promise<PetQueryServerAuthUser>{
		let userInfo:Record<string,unknown> = {};
		const subject = this._getFirstString(claims.sub,'');
		if(undefined !== accessToken && '' !== subject){
			const response = await oidc.fetchUserInfo(
				await this._getOidcConfig(),
				accessToken,
				subject
			);
			userInfo = response;
		}
		const username = this._getFirstString(
			userInfo.preferred_username,
			this._getFirstString(
				claims.preferred_username,
				this._getFirstString(userInfo.email,subject)
			)
		);
		const displayName = this._getFirstString(
			userInfo.name,
			this._getFirstString(claims.name,username)
		);
		return {
			username,
			displayName,
			group:this._hasOidcAdminGroup(claims,userInfo) ? 'admin' : 'user',
			provider:'oidc'
		};
	}

	protected _hasOidcAdminGroup(
		claims:Record<string,unknown>,
		userInfo:Record<string,unknown>
	):bool_t{
		const adminGroup = this._config.authenticate.oidc.admin_group;
		if('' === adminGroup){
			return false;
		}
		const values = [
			...this._getStringArray(claims.groups),
			...this._getStringArray(claims.roles),
			...this._getStringArray(userInfo.groups),
			...this._getStringArray(userInfo.roles)
		];
		return values.includes(adminGroup);
	}

	protected _getQueryString(value:unknown,name:utf8_t):utf8_t{
		if('string' !== typeof value || '' === value){
			throw new Error(`${name} is required`);
		}
		return value;
	}

	protected _getFirstString(value:unknown,fallback:utf8_t):utf8_t{
		if('string' === typeof value){
			return value;
		}
		if(Buffer.isBuffer(value)){
			return value.toString('utf8');
		}
		if(Array.isArray(value) && 0 < value.length){
			return this._getFirstString(value[0],fallback);
		}
		return fallback;
	}

	protected _getStringArray(value:unknown):Array<utf8_t>{
		if('string' === typeof value || Buffer.isBuffer(value)){
			return [this._getFirstString(value,'')].filter((item)=>{
				return '' !== item;
			});
		}
		if(!Array.isArray(value)){
			return [];
		}
		const ret:Array<utf8_t> = [];
		for(const item of value){
			const text = this._getFirstString(item,'');
			if('' !== text){
				ret.push(text);
			}
		}
		return ret;
	}

	protected async _unbind(client:LdapClient):Promise<void>{
		try{
			await client.unbind();
		}
		catch(UNUSED_e){
		}
	}
};
