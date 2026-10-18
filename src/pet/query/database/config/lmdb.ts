/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAssert } from '#petquery/assert.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';
import { PetQueryServerDatabaseConfig } from '#petquery/server/database/config.js';
import { open as LmdbOpen } from 'lmdb';

import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';

export class PetQueryDatabaseConfigLmdb
extends PetQueryDestructor
implements PetQueryServerDatabaseConfig{
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

	async serverConfigSave(serverUid:uuid_t,value:PetQuerySchemaServerDatabaseConfigEntryType):Promise<void>{
		this._assertNotDestroyed();
		this._db.put('config/' + serverUid,JSON.stringify(value));
	};
	
	async serverConfigLoad(serverUid:uuid_t):Promise<PetQuerySchemaServerDatabaseConfigEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('config/' + serverUid);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabaseConfigEntry.fromJson(JSON.parse(value));
	}
};