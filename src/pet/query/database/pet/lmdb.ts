/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { open as LmdbOpen } from 'lmdb';
import { PetQueryServerDatabasePet } from '#petquery/server/database/pet.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchemaServerDatabasePetEntry, type PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';
import { PetQueryAssert } from '#petquery/assert.js';
import { PetQueryJson } from '#petquery/json.js';

export type PetQueryDatabaseLmdbConfig = {
	path:filename_t;
	name:utf8_t;
};

export class PetQueryDatabasePetLmdb
extends PetQueryDestructor
implements PetQueryServerDatabasePet{
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

	async serverPetAdd(value:PetQuerySchemaServerDatabasePetEntryType){
		this._assertNotDestroyed();
		await this._db.put('pet/' + value.petId,JSON.stringify(value));
	};
	async serverPetGet(petId:utf8_t):Promise<PetQuerySchemaServerDatabasePetEntryType>{
		this._assertNotDestroyed();
		const value = this._db.get('pet/' + petId);
		PetQueryAssert.notNull(value);
		return PetQuerySchemaServerDatabasePetEntry.fromJson(JSON.parse(value));
	}
	async serverPetRemove(petId:utf8_t):Promise<void>{
		this._assertNotDestroyed();
		await this._db.remove('pet/' + petId);
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
		const regex = new RegExp(RegExp.escape(query),'im');
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