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

export class PetQueryDatabase{
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
		this._dbAuth = obj.dbAuth;
		this._dbConfig = obj.dbConfig;
		this._dbIndex = obj.dbIndex;
		this._dbPet = obj.dbPet;
		this._dbSession = obj.dbSession;
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
