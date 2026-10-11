/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {open} from 'lmdb';
import type {RootDatabase} from 'lmdb';
import {PetQueryServerDatabase} from '#petquery/server/database.js';

export class PetQueryServerDatabaseLmdb extends PetQueryServerDatabase{
	protected readonly _db:RootDatabase<utf8_t,utf8_t>;
	protected _destructorPromise:Promise<void>|null;

	// Opens the named database inside the LMDB environment at path.
	constructor(path:filename_t,name:utf8_t){
		super();
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
		this._destructorPromise = null;
	}

	override async get(key:utf8_t):Promise<utf8_t|undefined>{
		this._assertOpen();
		return this._db.get(key);
	}

	override async put(key:utf8_t,value:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.put(key,value);
	}

	override async remove(key:utf8_t):Promise<void>{
		this._assertOpen();
		await this._db.remove(key);
	}

	override async getEntries():Promise<Map<utf8_t,utf8_t>>{
		this._assertOpen();
		const entries = new Map<utf8_t,utf8_t>();
		for(const {key,value} of this._db.getRange()){
			entries.set(key,value);
		}
		return entries;
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
	}

	protected _assertOpen():void{
		if(null !== this._destructorPromise){
			throw new Error('LMDB database is closed');
		}
	}
};
