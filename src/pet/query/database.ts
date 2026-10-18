/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryServerDatabaseAuth} from
	'#petquery/server/database/auth.js';
import type {PetQueryServerDatabaseConfig} from
	'#petquery/server/database/config.js';
import type {PetQueryServerDatabaseIndex} from
	'#petquery/server/database/index.js';
import type {PetQueryServerDatabasePet} from
	'#petquery/server/database/pet.js';
import type {PetQueryServerDatabaseSession} from
	'#petquery/server/database/session.js';
import { PetQueryAssert } from './assert.js';
import { PetQueryDestructor } from './destructor.js';

export class PetQueryDatabase extends PetQueryDestructor{
	protected readonly _dbAuth:PetQueryServerDatabaseAuth|null;
	protected readonly _dbConfig:PetQueryServerDatabaseConfig|null;
	protected readonly _dbIndex:PetQueryServerDatabaseIndex|null;
	protected readonly _dbPet:PetQueryServerDatabasePet|null;
	protected readonly _dbSession:PetQueryServerDatabaseSession|null;
	
	constructor(obj:{
		dbAuth:PetQueryServerDatabaseAuth|null,
		dbConfig:PetQueryServerDatabaseConfig|null,
		dbIndex:PetQueryServerDatabaseIndex|null,
		dbPet:PetQueryServerDatabasePet|null,
		dbSession:PetQueryServerDatabaseSession|null
	}){
		super();
		this._dbAuth = obj.dbAuth;
		this._dbConfig = obj.dbConfig;
		this._dbIndex = obj.dbIndex;
		this._dbPet = obj.dbPet;
		this._dbSession = obj.dbSession;
	}

	async _destructor(){
		const cleanups:Array<Promise<void>> = [];
		if(null !== this._dbAuth){
			cleanups.push(this._dbAuth.destructor());
		}
		if(null !== this._dbConfig){
			cleanups.push(this._dbConfig.destructor());
		}
		if(null !== this._dbIndex){
			cleanups.push(this._dbIndex.destructor());
		}
		if(null !== this._dbPet){
			cleanups.push(this._dbPet.destructor());
		}
		if(null !== this._dbSession){
			cleanups.push(this._dbSession.destructor());
		}
		await Promise.allSettled(cleanups);
	}

	getDbAuth():PetQueryServerDatabaseAuth{
		PetQueryAssert.notNull(this._dbAuth);
		return this._dbAuth;
	}

	getDbConfig():PetQueryServerDatabaseConfig{
		PetQueryAssert.notNull(this._dbConfig);
		return this._dbConfig;
	}

	getDbIndex():PetQueryServerDatabaseIndex{
		PetQueryAssert.notNull(this._dbIndex);
		return this._dbIndex;
	}

	getDbPet():PetQueryServerDatabasePet{
		PetQueryAssert.notNull(this._dbPet);
		return this._dbPet;
	}

	getDbSession():PetQueryServerDatabaseSession{
		PetQueryAssert.notNull(this._dbSession);
		return this._dbSession;
	}
};
