/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthUser } from '#schema/api/auth/user.js';
import { PetQueryServerAuthStore } from '#petquery/server/auth/store.js';
import crypto from 'node:crypto';

import type { PetQueryConfigServerType } from '#petquery/config.js';
import type { PetQueryDatabase } from '#petquery/database.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';
import type { PetQueryServerAuthManagedUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUser } from '#petquery/server/auth.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	...PetQuerySchemaApiAuthUser.properties,
	sessionId:T.String({minLength:1}),
	createdAt:T.Integer({minimum:0}),
	expiresAt:T.Integer({minimum:0})
},{additionalProperties:false});
const validator = PetQuerySchema.compile(schema);
type PetQueryServerAuthSessionData = PetQuerySchemaStatic<typeof schema>;

export class PetQueryServerAuthSession{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _database:PetQueryDatabase;
	protected readonly _store:PetQueryServerAuthStore;
	protected _destroyed:bool_t;

	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase
	){
		this._config = config;
		this._database = database;
		this._store = new PetQueryServerAuthStore(database);
		this._destroyed = false;
	}

	destructor():void{
		try{
			this._destroyed = true;
			this._store.destructor();
		}
		catch(UNUSED_e){
		}
	}

	async getUser(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		this._assertNotDestroyed();
		const sessionId = this._getCookie(req);
		if(null === sessionId){
			return null;
		}
		const text = await this._store.get(`session:${sessionId}`);
		this._assertNotDestroyed();
		if(undefined === text){
			return null;
		}
		const session = PetQuerySchema.parse(validator,JSON.parse(text));
		if(sessionId !== session.sessionId){
			throw new Error('Authentication session identifier does not match');
		}
		return this._toUser(session);
	}

	async create(
		user:PetQueryServerAuthUser,
		res:PetQueryServerResponse
	):Promise<void>{
		this._assertNotDestroyed();
		const sessionId = crypto.randomBytes(32).toString('base64url');
		const now = Date.now();
		const maxAge = this._config.authenticate.session.max_age;
		const session:PetQueryServerAuthSessionData = {
			...user,
			sessionId,
			createdAt:now,
			expiresAt:now + maxAge
		};
		await this._store.put(
			`session:${sessionId}`,
			JSON.stringify(session),
			session.expiresAt
		);
		this._assertNotDestroyed();
		res.cookie(this._config.authenticate.session.cookie_name,sessionId,{
			httpOnly:true,
			secure:this._config.authenticate.session.secure,
			sameSite:'lax',
			maxAge,
			path:'/'
		});
	}

	async logout(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._assertNotDestroyed();
		const sessionId = this._getCookie(req);
		if(null !== sessionId){
			await this._store.remove(`session:${sessionId}`);
		}
		this._assertNotDestroyed();
		res.clearCookie(this._config.authenticate.session.cookie_name,{
			httpOnly:true,
			secure:this._config.authenticate.session.secure,
			sameSite:'lax',
			path:'/'
		});
	}

	async listUsers(
		provider:utf8_t
	):Promise<Array<PetQueryServerAuthManagedUser>>{
		this._assertNotDestroyed();
		const database = this._database.getDbSession();
		const entries = await database.serverSessionGetEntries();
		this._assertNotDestroyed();
		const users = new Map<utf8_t,PetQueryServerAuthManagedUser>();
		for(const entry of entries){
			if(!entry.sessionId.startsWith('session:')
			|| entry.expiredTs <= Date.now()){
				continue;
			}
			if(undefined === entry.data){
				throw new Error('Authentication session has no data');
			}
			const session = PetQuerySchema.parse(
				validator,
				JSON.parse(entry.data)
			);
			if(provider !== session.provider){
				continue;
			}
			users.set(session.username,{
				...this._toUser(session),
				createdAt:new Date(session.createdAt).toISOString()
			});
		}
		return Array.from(users.values());
	}

	protected _toUser(
		session:PetQueryServerAuthSessionData
	):PetQueryServerAuthUser{
		return {
			username:session.username,
			displayName:session.displayName,
			group:session.group,
			provider:session.provider
		};
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

	protected _assertNotDestroyed():void{
		if(this._destroyed){
			throw new Error('Authentication sessions are destroyed');
		}
	}
};
