/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {open} from 'lmdb';
import type {RootDatabase} from 'lmdb';
import {PetQueryDatabase} from '#petquery/database.js';

export type PetQueryDatabaseLmdbConfig = {
	path:filename_t;
	name:utf8_t;
	settings_name?:utf8_t;
};

export class PetQueryDatabaseLmdb extends PetQueryDatabase{
	protected static readonly _configKey = '__petquery_config__';
	protected readonly _db:RootDatabase<utf8_t,utf8_t>;
	protected readonly _config:PetQueryDatabaseLmdbConfig;
	protected _destructorPromise:Promise<void>|null;

	// Opens the named database inside the LMDB environment at path.
	constructor(config:PetQueryDatabaseLmdbConfig){
		super();
		const path = config.path;
		const name = config.name;
		if(0 === path.trim().length){
			throw new Error('LMDB database path must not be empty');
		}
		if(0 === name.trim().length){
			throw new Error('LMDB database name must not be empty');
		}
		this._db = open<utf8_t,utf8_t>({
			path,
			name,
			encoding:'string'
		});
		this._config = {...config};
		this._destructorPromise = null;
	}

	createSibling(name:utf8_t):PetQueryDatabaseLmdb{
		return new PetQueryDatabaseLmdb({
			 path:this._config.path
			,name
			,settings_name:this._config.settings_name
		});
	}

	createSettingsDatabase():PetQueryDatabaseLmdb{
		if(undefined === this._config.settings_name){
			throw new Error('LMDB settings database is not configured');
		}
		return this.createSibling(this._config.settings_name);
	}

	override async serverPetGet(
		key:utf8_t
	):Promise<utf8_t|undefined>{
		this._assertOpen();
		return this._db.get(key);
	}

	override async serverPetPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>{
		this._assertOpen();
		await this._db.put(key,value);
	}

	override async serverPetRemove(key:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.remove(key);
	}

	override async serverPetGetEntries():
		Promise<Map<utf8_t,utf8_t>>{
		this._assertOpen();
		const entries = new Map<utf8_t,utf8_t>();
		for(const {key,value} of this._db.getRange()){
			entries.set(key,value);
		}
		return entries;
	}

	override async serverSessionGet(
		key:utf8_t
	):Promise<utf8_t|undefined>{
		this._assertOpen();
		return this._db.get(key);
	}

	override async serverSessionPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>{
		this._assertOpen();
		await this._db.put(key,value);
	}

	override async serverSessionRemove(key:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.remove(key);
	}

	override async serverSessionGetEntries():
		Promise<Map<utf8_t,utf8_t>>{
		return this.serverPetGetEntries();
	}

	override async serverAuthGet(
		key:utf8_t
	):Promise<utf8_t|undefined>{
		this._assertOpen();
		return this._db.get(key);
	}

	override async serverAuthPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>{
		this._assertOpen();
		await this._db.put(key,value);
	}

	override async serverAuthRemove(key:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.remove(key);
	}

	override async serverAuthGetEntries():
		Promise<Map<utf8_t,utf8_t>>{
		return this.serverPetGetEntries();
	}

	override async serverIndexGet(
		key:utf8_t
	):Promise<utf8_t|undefined>{
		this._assertOpen();
		return this._db.get(key);
	}

	override async serverIndexPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>{
		this._assertOpen();
		await this._db.put(key,value);
	}

	override async serverIndexRemove(key:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.remove(key);
	}

	override async serverIndexGetEntries():
		Promise<Map<utf8_t,utf8_t>>{
		return this.serverPetGetEntries();
	}

	override async serverConfigSave(value:json_t):Promise<void>{
		this._assertOpen();
		await this._db.put(
			PetQueryDatabaseLmdb._configKey,
			JSON.stringify(value)
		);
	}

	override async serverConfigLoad():Promise<json_t|null>{
		this._assertOpen();
		const value = await this._db.get(
			PetQueryDatabaseLmdb._configKey
		);
		if(undefined === value){
			return null;
		}
		return JSON.parse(value);
	}

	override destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destructorPromise = this._close();
		}
		return this._destructorPromise;
	}

	protected async _close():Promise<void>{
		try{
			await this._db.close();
		}
		catch(UNUSED_e){
		}
		await super.destructor();
	}

	protected _assertOpen():void{
		if(null !== this._destructorPromise){
			throw new Error('LMDB database is closed');
		}
	}
};
