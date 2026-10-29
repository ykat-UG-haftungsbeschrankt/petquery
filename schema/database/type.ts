/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaAbstract } from '#petquery/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Enum([
		'lmdb',
		'mariadb',
		'mongodb',
		'postgresql',
		'redis',
		'sqlite'
	]
	,{
	 title:'GET /api/config/get File'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseTypeType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaDatabaseType extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaDatabaseTypeType
	>{
	protected static _instance:
		PetQuerySchemaDatabaseType | null = null;
	public static getInstance():PetQuerySchemaDatabaseType{
		if(this._instance === null){
			this._instance = new PetQuerySchemaDatabaseType();
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

const petQuerySchemaDatabaseType =
	PetQuerySchemaDatabaseType.getInstance();

export {
	petQuerySchemaDatabaseType as PetQuerySchemaDatabaseType
};