/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAssert } from '#petquery/assert.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQueryJson } from '#petquery/json.js';
import { PetQueryRegexp } from '#petquery/regexp.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';
import { PetQueryServerDatabasePet } from '#petquery/server/database/pet.js';
import { open as LmdbOpen } from 'lmdb';

import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';
import { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';
	
export class PetQueryDatabasePetLmdb
extends PetQueryDestructor
implements PetQueryServerDatabasePet{
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

	async serverPetAdd(value:PetQuerySchemaServerDatabasePetEntryType){
		this._assertNotDestroyed();
		await this._db.put('pet/' + value.gid,JSON.stringify(value));
	};
	async serverPetGet(
		gid:utf8_t
	):Promise<PetQuerySchemaServerDatabasePetEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('pet/' + gid);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabasePetEntry.fromJson(JSON.parse(value));
	}
	async serverPetRemove(gid:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('pet/' + gid);
	}
	async serverPetGetEntries():Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>{
		this._assertNotDestroyed();
		const entries:Array<PetQuerySchemaServerDatabasePetEntryType> = [];
		for(const {key,value} of this._db.getRange()){
			if(!key.startsWith('pet/')){
				continue;
			}
			entries.push(PetQuerySchemaServerDatabasePetEntry.fromJson(JSON.parse(value)));
		}
		return entries;
	}
	async serverPetSearch(query:utf8_t):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>{
		this._assertNotDestroyed();
		const entries:Array<PetQuerySchemaServerDatabasePetEntryType> = [];
		const regex = new RegExp(PetQueryRegexp.escape(query),'im');
		for(const entry of await this.serverPetGetEntries()){
			if(PetQueryJson.match(
				 entry
				,regex
			)){
				entries.push(entry);
			}
		}
		return entries;
	}
};