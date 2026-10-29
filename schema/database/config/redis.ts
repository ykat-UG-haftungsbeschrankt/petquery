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
const schema = T.Object({
	type:T.Literal('redis'),
	connectionString:T.String({minLength:1})
},{
	title:'Redis database configuration',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigRedisType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaDatabaseConfigRedis extends PetQuerySchemaAbstract<
	PetQuerySchemaDatabaseConfigRedisType
>{
	protected static _instance:PetQuerySchemaDatabaseConfigRedis|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaDatabaseConfigRedis{
		if(null === this._instance){
			this._instance = new PetQuerySchemaDatabaseConfigRedis();
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

const petQuerySchemaDatabaseConfigRedis =
	PetQuerySchemaDatabaseConfigRedis.getInstance();

export {
	petQuerySchemaDatabaseConfigRedis as PetQuerySchemaDatabaseConfigRedis
};
