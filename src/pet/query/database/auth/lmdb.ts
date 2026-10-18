/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';
import { open as LmdbOpen } from 'lmdb';

import type { Database } from 'lmdb';
import type { PetQueryServerDatabaseAuth } from '#petquery/server/database/auth.js';
import { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';

export class PetQueryDatabaseAuthLmdb
extends PetQueryDestructor
implements PetQueryServerDatabaseAuth{
	protected readonly _db:Database<utf8_t,utf8_t>;

	// Opens the named database inside the LMDB environment at path.
	constructor(config:PetQuerySchemaDatabaseConfigLmdbType){
		super();
		this._db = LmdbOpen<utf8_t,utf8_t>({
			path:config.path,
			name:config.name
		});
	}

	protected async _destructor():Promise<void>{
		try{
			await this._db.close();
		}
		catch(UNUSED_e){
		}
	}

	async serverAuthGet(key:utf8_t):Promise<utf8_t|undefined>{
		this._assertNotDestroyed();
		return this._db.get(key);
	}

	async serverAuthPut(key:utf8_t,value:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.put(key,value);
	}

	async serverAuthRemove(key:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove(key);
	}

	async serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>{
		this._assertNotDestroyed();
		const entries = new Map<utf8_t,utf8_t>();
		for(const {key,value} of this._db.getRange()){
			entries.set(key,value);
		}
		return entries;
	}
};