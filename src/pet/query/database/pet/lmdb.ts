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
import { PetQueryServerDatabasePetSearchLoader } from '#petquery/server/database/pet/search/loader.js';
import { open as LmdbOpen } from 'lmdb';

import type { PetQuerySchemaPluginFileType } from '#schema/plugin/file.js';
import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';
import { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';
	
export class PetQueryDatabasePetLmdb
extends PetQueryDestructor
implements PetQueryServerDatabasePet{
	protected readonly _db;
	protected readonly _petSearchLoader:
		PetQueryServerDatabasePetSearchLoader;

	// Opens the named database inside the LMDB environment at path.
	constructor(config:PetQuerySchemaDatabaseConfigLmdbType){
		super();
		this._db = LmdbOpen<utf8_t,utf8_t>({
			path:config.path,
			name:config.name
		});
		this._petSearchLoader = new PetQueryServerDatabasePetSearchLoader(
			'var/petquery-ai-search.sqlite3'
		);
	}
	protected async _destructor():Promise<void>{
		try{
			await Promise.allSettled([
				this._db.close(),
				this._petSearchLoader.destructor()
			]);
		}
		catch(UNUSED_e){
		}
	}

	async serverPetAdd(value:PetQuerySchemaServerDatabasePetEntryType){
		this._assertNotDestroyed();
		this._petSearchLoader._invalidate();
		try{
			await this._db.put('pet/' + value.gid,JSON.stringify(value));
		}
		finally{
			this._petSearchLoader._invalidate();
		}
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
		this._petSearchLoader._invalidate();
		try{
			await this._db.remove('pet/' + gid);
		}
		finally{
			this._petSearchLoader._invalidate();
		}
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
	async serverPetSearchByFile(
		files:Array<PetQuerySchemaPluginFileType>
	):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>{
		this._assertNotDestroyed();
		const petSearch = await this._petSearchLoader._getSearch();
		return petSearch._searchByFile(
			files,
			this.serverPetGetEntries.bind(this)
		);
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