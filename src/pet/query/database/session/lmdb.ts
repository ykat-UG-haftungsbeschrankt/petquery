/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { open as LmdbOpen } from 'lmdb';
import { PetQueryServerDatabaseSession } from '#petquery/server/database/session.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabaseSessionEntry, type PetQuerySchemaServerDatabaseSessionEntryType } from '#schema/server/database/session/entry.js';
import { PetQueryAssert } from '#petquery/assert.js';

export type PetQueryDatabaseLmdbConfig = {
	path:filename_t;
	name:utf8_t;
};

export class PetQueryDatabaseSessionLmdb
extends PetQueryDestructor
implements PetQueryServerDatabaseSession{
	protected readonly _db;

	// Opens the named database inside the LMDB environment at path.
	constructor(config:PetQueryDatabaseLmdbConfig){
		super();
		this._db = LmdbOpen<utf8_t,utf8_t>({
			path:config.path,
			name:config.name
		});
	}
	protected async _destructor():Promise<void>{
		await this._db.close();
	}

	async serverSessionAdd(value:PetQuerySchemaServerDatabaseSessionEntryType){
		this._assertNotDestroyed();
		this._db.put('session/' + value.sessionId,JSON.stringify(value));
	};
	async serverSessionGet(sessionId:utf8_t):Promise<PetQuerySchemaServerDatabaseSessionEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('session/' + sessionId);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabaseSessionEntry.fromJson(JSON.parse(value));
	}
	async serverSessionRemove(sessionId:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('session/' + sessionId);
	}
	protected _isExpired(entry:PetQuerySchemaServerDatabaseSessionEntryType):boolean{
		const now = Date.now();
		return now >= entry.expiredTs;
	}
	async serverSessionDeleteExpired():Promise<void>{
		this._assertNotDestroyed();
		for(const {key,value} of this._db.getRange()){
			if(!key.startsWith('session/')){
				continue;
			}
			const entry = PetQuerySchemaServerDatabaseSessionEntry.fromJson(JSON.parse(value));
			if(this._isExpired(entry)){
				await this._db.remove(key);
			}
		}
	}
};