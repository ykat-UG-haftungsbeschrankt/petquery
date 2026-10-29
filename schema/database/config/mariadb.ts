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
	type:T.Literal('mariadb'),
	connectionString:T.String({minLength:1})
},{
	title:'MariaDB database configuration',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigMariadbType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaDatabaseConfigMariadb extends PetQuerySchemaAbstract<
	PetQuerySchemaDatabaseConfigMariadbType
>{
	protected static _instance:PetQuerySchemaDatabaseConfigMariadb|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaDatabaseConfigMariadb{
		if(null === this._instance){
			this._instance = new PetQuerySchemaDatabaseConfigMariadb();
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

const petQuerySchemaDatabaseConfigMariadb =
	PetQuerySchemaDatabaseConfigMariadb.getInstance();

export {
	petQuerySchemaDatabaseConfigMariadb as
	PetQuerySchemaDatabaseConfigMariadb
};
