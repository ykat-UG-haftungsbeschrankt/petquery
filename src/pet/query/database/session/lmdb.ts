/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabaseSessionEntry } from '#schema/server/database/session/entry.js';
import { open as LmdbOpen } from 'lmdb';

import type { PetQuerySchemaServerDatabaseSessionEntryType } from '#schema/server/database/session/entry.js';
import type { PetQueryServerDatabaseSession } from '#petquery/server/database/session.js';

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
		try{
			await this._db.close();
		}
		catch(UNUSED_e){
		}
	}

	async serverSessionAdd(
		value:PetQuerySchemaServerDatabaseSessionEntryType
	):Promise<void>{
		this._assertNotDestroyed();
		await this._db.put('session/' + value.sessionId,JSON.stringify(value));
	};
	async serverSessionGet(
		sessionId:utf8_t
	):Promise<PetQuerySchemaServerDatabaseSessionEntryType|undefined>{
		this._assertNotDestroyed();
		const value = this._db.get('session/' + sessionId);
		if(undefined === value){
			return undefined;
		}
		return PetQuerySchemaServerDatabaseSessionEntry.fromJson(
			JSON.parse(value)
		);
	}
	async serverSessionGetEntries():Promise<
		Array<PetQuerySchemaServerDatabaseSessionEntryType>
	>{
		this._assertNotDestroyed();
		const entries:Array<PetQuerySchemaServerDatabaseSessionEntryType> = [];
		for(const {key,value} of this._db.getRange()){
			if(key.startsWith('session/')){
				entries.push(
					PetQuerySchemaServerDatabaseSessionEntry.fromJson(
						JSON.parse(value)
					)
				);
			}
		}
		return entries;
	}
	async serverSessionRemove(sessionId:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('session/' + sessionId);
	}
	protected _isExpired(
		entry:PetQuerySchemaServerDatabaseSessionEntryType
	):bool_t{
		const now = Date.now();
		return entry.expiredTs <= now;
	}
	async serverSessionDeleteExpired():Promise<void>{
		this._assertNotDestroyed();
		for(const {key,value} of this._db.getRange()){
			if(!key.startsWith('session/')){
				continue;
			}
			const entry = PetQuerySchemaServerDatabaseSessionEntry.fromJson(
				JSON.parse(value)
			);
			if(this._isExpired(entry)){
				await this._db.remove(key);
			}
		}
	}
};