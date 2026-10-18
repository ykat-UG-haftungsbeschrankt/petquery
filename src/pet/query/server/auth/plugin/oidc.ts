/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerAuthPlugin } from '#petquery/server/auth/plugin.js';
import { PetQueryServerAuthStore } from '#petquery/server/auth/store.js';
import * as oidc from 'openid-client';

import type { AuthorizationCodeGrantChecks } from 'openid-client';
import type { Configuration } from 'openid-client';
import type { PetQueryConfigServerType } from '#petquery/config.js';
import type { PetQueryDatabase } from '#petquery/database.js';
import type { PetQueryServerAuthUser } from '#petquery/server/auth.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';

type PetQueryServerAuthOidcPending = {
	state:utf8_t;
	nonce:utf8_t;
	codeVerifier:utf8_t;
	expiresAt:milliseconds_t;
};

const T = PetQuerySchema.type;
const oidcPendingValidator = PetQuerySchema.compile(T.Object({
	state:T.String({minLength:1}),
	nonce:T.String({minLength:1}),
	codeVerifier:T.String({minLength:1}),
	expiresAt:T.Integer({minimum:0})
},{additionalProperties:false}));

export class PetQueryServerAuthPluginOidc extends PetQueryServerAuthPlugin{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _store:PetQueryServerAuthStore;
	protected readonly _callbacks:Set<utf8_t>;
	protected _oidcConfig:Promise<Configuration>|null;
	protected _destructorPromise:Promise<void>|null;

	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase
	){
		super();
		this._config = config;
		this._store = new PetQueryServerAuthStore(database);
		this._callbacks = new Set();
		this._oidcConfig = null;
		this._destructorPromise = null;
	}

	override destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destroyed = true;
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
		try{
			this._store.destructor();
			this._oidcConfig = null;
			this._callbacks.clear();
			await super.destructor();
		}
		catch(UNUSED_e){
		}
	}

	getName():utf8_t{
		return 'oidc';
	}

	getLoginType():'bearer'|'password'|'redirect'{
		return 'redirect';
	}

	async login(
		UNUSED_req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser>{
		throw new Error('Use /auth/oidc/login for OpenID Connect');
	}

	override async getLoginUrl():Promise<URL>{
		const discovery = await this._getOidcConfig();
		this._assertNotDestroyed();
		const config = this._config.authenticate.oidc;
		const state = oidc.randomState();
		const nonce = oidc.randomNonce();
		const codeVerifier = oidc.randomPKCECodeVerifier();
		const challenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
		this._assertNotDestroyed();
		const pending:PetQueryServerAuthOidcPending = {
			state,
			nonce,
			codeVerifier,
			expiresAt:Date.now() + 10 * 60 * 1000
		};
		await this._store.put(
			this._getOidcKey(state),
			JSON.stringify(pending),
			pending.expiresAt
		);
		this._assertNotDestroyed();
		return oidc.buildAuthorizationUrl(discovery,{
			redirect_uri:config.redirect_uri,
			scope:config.scopes,
			state,
			nonce,
			code_challenge:challenge,
			code_challenge_method:'S256'
		});
	}

	override async handleCallback(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser>{
		this._assertNotDestroyed();
		const state = this._getQueryString(req.query.state,'state');
		if(this._callbacks.has(state)){
			throw new Error('OIDC state is already being consumed');
		}
		this._callbacks.add(state);
		try{
			const pending = await this._consumePending(state);
			const checks:AuthorizationCodeGrantChecks = {
				expectedState:state,
				expectedNonce:pending.nonce,
				pkceCodeVerifier:pending.codeVerifier
			};
			const discovery = await this._getOidcConfig();
			this._assertNotDestroyed();
			const tokens = await oidc.authorizationCodeGrant(
				discovery,
				this._getOidcCallbackUrl(req),
				checks
			);
			this._assertNotDestroyed();
			const user = await this._getOidcUser(
				tokens.access_token,
				tokens.claims() ?? {}
			);
			this._assertNotDestroyed();
			return user;
		}
		finally{
			this._callbacks.delete(state);
		}
	}

	protected async _consumePending(
		state:utf8_t
	):Promise<PetQueryServerAuthOidcPending>{
		const key = this._getOidcKey(state);
		const text = await this._store.get(key);
		this._assertNotDestroyed();
		if(undefined === text){
			throw new Error('OIDC state is invalid or expired');
		}
		await this._store.remove(key);
		this._assertNotDestroyed();
		const pending = PetQuerySchema.parse(
			oidcPendingValidator,
			JSON.parse(text)
		);
		if(state !== pending.state || Date.now() > pending.expiresAt){
			throw new Error('OIDC state is invalid or expired');
		}
		return pending;
	}

	protected _getOidcConfig():Promise<Configuration>{
		this._assertNotDestroyed();
		if(null === this._oidcConfig){
			const config = this._config.authenticate.oidc;
			if('' === config.issuer || '' === config.client_id
			|| '' === config.redirect_uri){
				throw new Error('OpenID Connect is not configured');
			}
			this._oidcConfig = this._discover();
		}
		return this._oidcConfig;
	}

	protected async _discover():Promise<Configuration>{
		const config = this._config.authenticate.oidc;
		try{
			const discovery = await oidc.discovery(
				new URL(config.issuer),
				config.client_id,
				{
					client_secret:config.client_secret,
					redirect_uris:[config.redirect_uri],
					response_types:['code']
				},
				oidc.ClientSecretPost(config.client_secret)
			);
			this._assertNotDestroyed();
			return discovery;
		}
		catch(error){
			if(!this._destroyed){
				this._oidcConfig = null;
			}
			throw error;
		}
	}

	protected _getOidcCallbackUrl(req:PetQueryServerRequest):URL{
		const configured = new URL(
			this._config.authenticate.oidc.redirect_uri
		);
		const index = req.originalUrl.indexOf('?');
		configured.search = index < 0 ? '' : req.originalUrl.slice(index + 1);
		return configured;
	}

	protected async _getOidcUser(
		accessToken:utf8_t|undefined,
		claims:Record<utf8_t,unknown>
	):Promise<PetQueryServerAuthUser>{
		let userInfo:Record<utf8_t,unknown> = {};
		const subject = this._getFirstString(claims.sub,'');
		if(undefined !== accessToken && '' !== subject){
			const discovery = await this._getOidcConfig();
			this._assertNotDestroyed();
			userInfo = await oidc.fetchUserInfo(
				discovery,
				accessToken,
				subject
			);
			this._assertNotDestroyed();
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
			provider:this.getName()
		};
	}

	protected _hasOidcAdminGroup(
		claims:Record<utf8_t,unknown>,
		userInfo:Record<utf8_t,unknown>
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

	protected _getOidcKey(state:utf8_t):utf8_t{
		return `oidc:${state}`;
	}

};
