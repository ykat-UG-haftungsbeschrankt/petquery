/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetQueryDatabase } from '#petquery/database.js';

export class PetQueryServerAuthStore{
	protected readonly _database:PetQueryDatabase;
	protected _destroyed:bool_t;

	constructor(database:PetQueryDatabase){
		this._database = database;
		this._destroyed = false;
	}

	destructor():void{
		this._destroyed = true;
	}

	async get(key:utf8_t):Promise<utf8_t|undefined>{
		this._assertNotDestroyed();
		const entry = await this._database.getDbSession().serverSessionGet(key);
		this._assertNotDestroyed();
		if(undefined === entry){
			return undefined;
		}
		if(entry.expiredTs <= Date.now()){
			await this.remove(key);
			return undefined;
		}
		if(undefined === entry.data){
			throw new Error(`Authentication record "${key}" has no data`);
		}
		return entry.data;
	}

	async put(
		key:utf8_t,
		value:utf8_t,
		expiresAt:milliseconds_t
	):Promise<void>{
		this._assertNotDestroyed();
		await this._database.getDbSession().serverSessionAdd({
			sessionId:key,
			createdTs:Date.now(),
			expiredTs:expiresAt,
			data:value
		});
	}

	async remove(key:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._database.getDbSession().serverSessionRemove(key);
	}

	protected _assertNotDestroyed():void{
		if(this._destroyed){
			throw new Error('Authentication store is destroyed');
		}
	}
};
