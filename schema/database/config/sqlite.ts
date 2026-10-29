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
	type:T.Literal('sqlite'),
	path:T.String({minLength:1})
},{
	title:'SQLite database configuration',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaDatabaseConfigSqliteType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaDatabaseConfigSqlite extends PetQuerySchemaAbstract<
	PetQuerySchemaDatabaseConfigSqliteType
>{
	protected static _instance:PetQuerySchemaDatabaseConfigSqlite|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaDatabaseConfigSqlite{
		if(null === this._instance){
			this._instance = new PetQuerySchemaDatabaseConfigSqlite();
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

const petQuerySchemaDatabaseConfigSqlite =
	PetQuerySchemaDatabaseConfigSqlite.getInstance();

export {
	petQuerySchemaDatabaseConfigSqlite as PetQuerySchemaDatabaseConfigSqlite
};
