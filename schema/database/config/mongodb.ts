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
	type:T.Literal('mongodb'),
	connectionString:T.String({minLength:1}),
	database:T.String({minLength:1,maxLength:64})
},{
	title:'MongoDB database configuration',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigMongodbType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaDatabaseConfigMongodb extends PetQuerySchemaAbstract<
	PetQuerySchemaDatabaseConfigMongodbType
>{
	protected static _instance:PetQuerySchemaDatabaseConfigMongodb|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaDatabaseConfigMongodb{
		if(null === this._instance){
			this._instance = new PetQuerySchemaDatabaseConfigMongodb();
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

const petQuerySchemaDatabaseConfigMongodb =
	PetQuerySchemaDatabaseConfigMongodb.getInstance();

export {
	petQuerySchemaDatabaseConfigMongodb as
	PetQuerySchemaDatabaseConfigMongodb
};
