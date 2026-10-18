/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { open as LmdbOpen } from 'lmdb';
import { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabaseIndexEntry, type PetQuerySchemaServerDatabaseIndexEntryType } from '#schema/server/database/index/entry.js';
import { PetQueryAssert } from '#petquery/assert.js';

export type PetQueryDatabaseLmdbConfig = {
	path:filename_t;
	name:utf8_t;
};

export class PetQueryDatabaseIndexLmdb
extends PetQueryDestructor
implements PetQueryServerDatabaseIndex{
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

	async serverIndexGetServerUid():Promise<uuid_t|undefined>{
		this._assertNotDestroyed();
		return this._db.get('server/uid');
	}
	async serverIndexSetServerUid(uid:uuid_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.put('server/uid',uid);
	}
	async serverIndexAddServer(value:PetQuerySchemaServerDatabaseIndexEntryType){
		this._assertNotDestroyed();
		this._db.put('index/' + value.uid,JSON.stringify(value));
	};
	async serverIndexGetServer(uid:utf8_t):Promise<PetQuerySchemaServerDatabaseIndexEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('index/' + uid);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabaseIndexEntry.fromJson(JSON.parse(value));
	}
	async serverIndexRemoveServer(uid:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('index/' + uid);
	}
	async serverIndexGetServerList():Promise<Array<PetQuerySchemaServerDatabaseIndexEntryType>>{
		this._assertNotDestroyed();
		const result = new Array<PetQuerySchemaServerDatabaseIndexEntryType>();
		for(const {key,value} of this._db.getRange()){
			if(!key.startsWith('index/')) continue;
			result.push(PetQuerySchemaServerDatabaseIndexEntry.fromJson(JSON.parse(value)));
		}
		return result;
	}
};
