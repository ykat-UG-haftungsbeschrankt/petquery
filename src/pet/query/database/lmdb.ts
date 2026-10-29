/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDatabase } from '#petquery/database.js';
import { PetQueryDatabaseAuthLmdb } from '#petquery/database/auth/lmdb.js';
import { PetQueryDatabaseConfigLmdb } from '#petquery/database/config/lmdb.js';
import { PetQueryDatabaseIndexLmdb } from '#petquery/database/index/lmdb.js';
import { PetQueryDatabasePetLmdb } from '#petquery/database/pet/lmdb.js';
import { PetQueryDatabaseSessionLmdb } from '#petquery/database/session/lmdb.js';
import { resolve } from 'node:path';

import type { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';
import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';

type PetQueryDatabaseLmdbConfig = Extract<
	PetQuerySchemaServerDatabaseConfigEntryType['database'],
	{type:'lmdb'}
>;

export class PetQueryDatabaseLmdb extends PetQueryDatabase{
	constructor(
		config:PetQueryDatabaseLmdbConfig,
		configDirectory:filename_t,
		aiSearchPath:filename_t
	){
		super(
			PetQueryDatabaseLmdb._createDatabase(
				config,
				configDirectory,
				aiSearchPath
			)
		);
	}

	protected static _createDatabase(
		config:PetQueryDatabaseLmdbConfig,
		configDirectory:filename_t,
		aiSearchPath:filename_t
	){
		const path = resolve(configDirectory,config.path);
		return {
			dbAuth:new PetQueryDatabaseAuthLmdb(
				PetQueryDatabaseLmdb._makeConfig(path,'auth')
			),
			dbConfig:new PetQueryDatabaseConfigLmdb(
				PetQueryDatabaseLmdb._makeConfig(path,'config')
			),
			dbIndex:new PetQueryDatabaseIndexLmdb(
				PetQueryDatabaseLmdb._makeConfig(path,'index')
			),
			dbPet:new PetQueryDatabasePetLmdb(
				PetQueryDatabaseLmdb._makeConfig(path,'pet'),
				aiSearchPath
			),
			dbSession:new PetQueryDatabaseSessionLmdb(
				PetQueryDatabaseLmdb._makeConfig(path,'session')
			)
		};
	}

	protected static _makeConfig(
		path:filename_t,
		name:utf8_t
	):PetQuerySchemaDatabaseConfigLmdbType{
		return {type:'lmdb',path,name};
	}
};
