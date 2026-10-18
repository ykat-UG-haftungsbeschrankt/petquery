/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerAuthPlugin } from '#petquery/server/auth/plugin.js';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

import type { PetQueryConfigServerType } from '#petquery/config.js';
import type { PetQueryDatabase } from '#petquery/database.js';
import type { PetQueryServerAuthCreateUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthManagedUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUpdateUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUser } from '#petquery/server/auth.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';

type PetQueryServerAuthLocalUser = PetQueryServerAuthManagedUser & {
	passwordHash:utf8_t;
	updatedAt:utf8_t;
};

const T = PetQuerySchema.type;
const scrypt = promisify(crypto.scrypt);
const localUserValidator = PetQuerySchema.compile(T.Object({
	username:T.String({minLength:1,maxLength:128}),
	displayName:T.String({maxLength:256}),
	group:T.Union([T.Literal('admin'),T.Literal('user')]),
	provider:T.Literal('lmdb'),
	passwordHash:T.String({minLength:1}),
	createdAt:T.String({minLength:1}),
	updatedAt:T.String({minLength:1})
},{additionalProperties:false}));

export class PetQueryServerAuthPluginLmdb extends PetQueryServerAuthPlugin{
	protected readonly _config:PetQueryConfigServerType;
	// Borrowed; its owner closes it.
	protected readonly _database:PetQueryDatabase;

	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase
	){
		super();
		this._config = config;
		this._database = database;
	}

	getName():utf8_t{
		return 'lmdb';
	}

	getLoginType():'bearer'|'password'|'redirect'{
		return 'password';
	}

	override supportsUserManagement():bool_t{
		return true;
	}

	async login(req:PetQueryServerRequest):Promise<PetQueryServerAuthUser>{
		this._assertNotDestroyed();
		const body = this._getPasswordLogin(req);
		const user = await this._getLocalUser(body.username);
		this._assertNotDestroyed();
		if(null === user
		|| !await this._verifyPassword(body.password,user.passwordHash)){
			throw new Error('Invalid username or password');
		}
		this._assertNotDestroyed();
		return this._toAuthUser(user);
	}

	override async listUsers():Promise<Array<PetQueryServerAuthManagedUser>>{
		this._assertNotDestroyed();
		const entries = await this._database.getDbAuth().serverAuthGetEntries();
		this._assertNotDestroyed();
		const users:Array<PetQueryServerAuthManagedUser> = [];
		for(const [key,value] of entries){
			if(key.startsWith('user:')){
				users.push(this._toManagedUser(this._parseLocalUser(value)));
			}
		}
		users.sort(this._compareUsers.bind(this));
		return users;
	}

	override async createUser(
		values:PetQueryServerAuthCreateUser
	):Promise<PetQueryServerAuthManagedUser>{
		this._assertNotDestroyed();
		this._validateUserInput(values.username,values.password);
		const existing = await this._database.getDbAuth().serverAuthGet(
			this._getUserKey(values.username)
		);
		this._assertNotDestroyed();
		if(undefined !== existing){
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
		this._assertNotDestroyed();
		await this._database.getDbAuth().serverAuthPut(
			this._getUserKey(values.username),
			JSON.stringify(user)
		);
		this._assertNotDestroyed();
		return this._toManagedUser(user);
	}

	override async updateUser(
		username:utf8_t,
		values:PetQueryServerAuthUpdateUser
	):Promise<PetQueryServerAuthManagedUser>{
		this._assertNotDestroyed();
		this._validateUserInput(username,null);
		const existing = await this._getLocalUser(username);
		this._assertNotDestroyed();
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
		this._assertNotDestroyed();
		await this._database.getDbAuth().serverAuthPut(
			this._getUserKey(username),
			JSON.stringify(user)
		);
		this._assertNotDestroyed();
		return this._toManagedUser(user);
	}

	override async deleteUser(username:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		this._validateUserInput(username,null);
		await this._database.getDbAuth().serverAuthRemove(
			this._getUserKey(username)
		);
		this._assertNotDestroyed();
	}

	protected _compareUsers(
		left:PetQueryServerAuthManagedUser,
		right:PetQueryServerAuthManagedUser
	):int_t{
		return left.username.localeCompare(right.username);
	}

	protected async _getLocalUser(
		username:utf8_t
	):Promise<PetQueryServerAuthLocalUser|null>{
		const text = await this._database.getDbAuth().serverAuthGet(
			this._getUserKey(username)
		);
		this._assertNotDestroyed();
		return undefined === text ? null : this._parseLocalUser(text);
	}

	protected async _hashPassword(password:utf8_t):Promise<utf8_t>{
		this._assertNotDestroyed();
		const salt = crypto.randomBytes(16).toString('base64url');
		const hash = await scrypt(password,salt,64);
		this._assertNotDestroyed();
		if(!(hash instanceof Buffer)){
			throw new Error('Password hash failed');
		}
		return `scrypt:${salt}:${hash.toString('base64url')}`;
	}

	protected async _verifyPassword(
		password:utf8_t,
		stored:utf8_t
	):Promise<bool_t>{
		this._assertNotDestroyed();
		const parts = stored.split(':');
		if(3 !== parts.length || 'scrypt' !== parts[0]){
			return false;
		}
		const expected = Buffer.from(parts[2],'base64url');
		if(64 !== expected.length || '' === parts[1]){
			return false;
		}
		const actual = await scrypt(password,parts[1],64);
		this._assertNotDestroyed();
		if(!(actual instanceof Buffer)
		|| expected.length !== actual.length){
			return false;
		}
		return crypto.timingSafeEqual(actual,expected);
	}

	protected _parseLocalUser(text:utf8_t):PetQueryServerAuthLocalUser{
		return PetQuerySchema.parse(localUserValidator,JSON.parse(text));
	}

	protected _toAuthUser(
		user:PetQueryServerAuthLocalUser
	):PetQueryServerAuthUser{
		return {
			username:user.username,
			displayName:user.displayName,
			group:user.group,
			provider:this.getName()
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

	protected _getUserKey(username:utf8_t):utf8_t{
		return `user:${username}`;
	}
};
