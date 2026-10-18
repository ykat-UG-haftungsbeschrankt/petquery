/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema, PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	 type:'lmdb'
	,path:T.String()
	,name:T.String()
},{
	 title:'GET /api/config/get File'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigLmdbType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaDatabaseConfigLmdb extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaDatabaseConfigLmdbType
	>{
	protected static _instance:
		PetQuerySchemaDatabaseConfigLmdb | null = null;
	public static getInstance():PetQuerySchemaDatabaseConfigLmdb{
		if(this._instance === null){
			this._instance = new PetQuerySchemaDatabaseConfigLmdb();
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

const petQuerySchemaDatabaseConfigLmdb =
	PetQuerySchemaDatabaseConfigLmdb.getInstance();

export {
	petQuerySchemaDatabaseConfigLmdb as PetQuerySchemaDatabaseConfigLmdb
};