/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetQueryServerAuthCreateUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthManagedUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUpdateUser } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUser } from '#petquery/server/auth.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';

export abstract class PetQueryServerAuthPlugin{
	protected _destroyed:bool_t;

	constructor(){
		this._destroyed = false;
	}

	abstract getName():utf8_t;
	abstract getLoginType():'bearer'|'password'|'redirect';
	abstract login(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser>;

	async destructor():Promise<void>{
		this._destroyed = true;
	}

	async authenticate(
		UNUSED_req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		this._assertNotDestroyed();
		return null;
	}

	supportsUserManagement():bool_t{
		return false;
	}

	async listUsers():Promise<Array<PetQueryServerAuthManagedUser>>{
		throw new Error('User management is read-only for this provider');
	}

	async createUser(
		UNUSED_values:PetQueryServerAuthCreateUser
	):Promise<PetQueryServerAuthManagedUser>{
		throw new Error('User management is read-only for this provider');
	}

	async updateUser(
		UNUSED_username:utf8_t,
		UNUSED_values:PetQueryServerAuthUpdateUser
	):Promise<PetQueryServerAuthManagedUser>{
		throw new Error('User management is read-only for this provider');
	}

	async deleteUser(UNUSED_username:utf8_t):Promise<void>{
		throw new Error('User management is read-only for this provider');
	}

	async getLoginUrl():Promise<URL>{
		throw new Error('Redirect login is unsupported for this provider');
	}

	async handleCallback(
		UNUSED_req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser>{
		throw new Error('Redirect login is unsupported for this provider');
	}

	protected _getPasswordLogin(req:PetQueryServerRequest):{
		username:utf8_t;
		password:utf8_t;
	}{
		const body:unknown = req.body;
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
			const text = this._getFirstString(value,'');
			return '' === text ? [] : [text];
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

	protected _assertNotDestroyed():void{
		if(this._destroyed){
			throw new Error('Authentication provider is destroyed');
		}
	}
};
