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
	type:T.Literal('postgresql'),
	connectionString:T.String({minLength:1})
},{
	title:'PostgreSQL database configuration',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigPostgresqlType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaDatabaseConfigPostgresql extends PetQuerySchemaAbstract<
	PetQuerySchemaDatabaseConfigPostgresqlType
>{
	protected static _instance:PetQuerySchemaDatabaseConfigPostgresql|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaDatabaseConfigPostgresql{
		if(null === this._instance){
			this._instance = new PetQuerySchemaDatabaseConfigPostgresql();
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

const petQuerySchemaDatabaseConfigPostgresql =
	PetQuerySchemaDatabaseConfigPostgresql.getInstance();

export {
	petQuerySchemaDatabaseConfigPostgresql as
	PetQuerySchemaDatabaseConfigPostgresql
};
