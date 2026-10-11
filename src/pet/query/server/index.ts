/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {validate as uuidValidate} from 'uuid';
import type {PetQueryServerDatabase} from '#petquery/server/database.js';

// Persistent UUID-to-URI server index. The database is borrowed; its owner
// must call its destructor.
export class PetQueryServerIndex{
	protected readonly _db:PetQueryServerDatabase;

	constructor(db:PetQueryServerDatabase){
		this._db = db;
	}

	// Persists the server, replacing the URI if the UUID already exists.
	async addServer(uuid:uuid_t,uri:uri_t):Promise<void>{
		this._validateUuid(uuid);
		new URL(uri);
		await this._db.put(uuid,uri);
	}

	// Removes the server; a missing UUID is a no-op.
	async deleteServer(uuid:uuid_t):Promise<void>{
		this._validateUuid(uuid);
		await this._db.remove(uuid);
	}

	// Returns an independent snapshot of all servers.
	async getServerList():Promise<Map<uuid_t,uri_t>>{
		return this._db.getEntries();
	}

	destructor():void{
	}

	protected _validateUuid(uuid:uuid_t):void{
		if(!uuidValidate(uuid)){
			throw new Error(`Invalid server UUID: ${uuid}`);
		}
	}
};
