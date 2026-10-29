/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAssert } from '#petquery/assert.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabaseIndexEntry } from '#schema/server/database/index/entry.js';
import { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
import { open as LmdbOpen } from 'lmdb';

import type { PetQuerySchemaServerDatabaseIndexEntryType } from '#schema/server/database/index/entry.js';
import { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';

export class PetQueryDatabaseIndexLmdb
extends PetQueryDestructor
implements PetQueryServerDatabaseIndex{
	protected readonly _db;

	// Opens the named database inside the LMDB environment at path.
	constructor(config:PetQuerySchemaDatabaseConfigLmdbType){
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
		const value = this._db.get('server/uid');
		return value;
	}
	async serverIndexSetServerUid(gid:uuid_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.put('server/uid',gid);
	}
	async serverIndexAddServer(value:PetQuerySchemaServerDatabaseIndexEntryType){
		this._assertNotDestroyed();
		this._db.put('index/' + value.gid,JSON.stringify(value));
	};
	async serverIndexGetServer(
		gid:utf8_t
	):Promise<PetQuerySchemaServerDatabaseIndexEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('index/' + gid);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabaseIndexEntry.fromJson(JSON.parse(value));
	}
	async serverIndexRemoveServer(gid:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('index/' + gid);
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
