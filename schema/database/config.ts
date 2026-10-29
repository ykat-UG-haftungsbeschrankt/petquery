/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaAbstract } from '#petquery/schema.js';
import { PetQuerySchemaDatabaseConfigLmdb } from '#schema/database/config/lmdb.js';
import { PetQuerySchemaDatabaseConfigMariadb } from '#schema/database/config/mariadb.js';
import { PetQuerySchemaDatabaseConfigMongodb } from '#schema/database/config/mongodb.js';
import { PetQuerySchemaDatabaseConfigPostgresql } from '#schema/database/config/postgresql.js';
import { PetQuerySchemaDatabaseConfigRedis } from '#schema/database/config/redis.js';
import { PetQuerySchemaDatabaseConfigSqlite } from '#schema/database/config/sqlite.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Union([
	PetQuerySchemaDatabaseConfigLmdb.getSchema(),
	PetQuerySchemaDatabaseConfigPostgresql.getSchema(),
	PetQuerySchemaDatabaseConfigMariadb.getSchema(),
	PetQuerySchemaDatabaseConfigMongodb.getSchema(),
	PetQuerySchemaDatabaseConfigRedis.getSchema(),
	PetQuerySchemaDatabaseConfigSqlite.getSchema()
],{
	 title:'GET /api/config/get File'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaDatabaseConfig extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaDatabaseConfigType
	>{
	protected static _instance:
		PetQuerySchemaDatabaseConfig | null = null;
	public static getInstance():PetQuerySchemaDatabaseConfig{
		if(this._instance === null){
			this._instance = new PetQuerySchemaDatabaseConfig();
		}
		return this._instance;
	}
	getSchema(){
		return schema;
	}
	getValidator(){
		return validator;
	}
};

const petQuerySchemaDatabaseConfig =
	PetQuerySchemaDatabaseConfig.getInstance();

export {
	petQuerySchemaDatabaseConfig as PetQuerySchemaDatabaseConfig
};