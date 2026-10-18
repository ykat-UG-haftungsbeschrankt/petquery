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
	 gid:T.String({minLength:1})
	,createdTs:T.Integer({minimum:0})
	,expiredTs:T.Integer({minimum:0})
	,data:T.Optional(T.String())
},{
	title:'Persisted session or pending authentication record',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabaseSessionEntryType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaServerDatabaseSessionEntry extends PetQuerySchemaAbstract<
	PetQuerySchemaServerDatabaseSessionEntryType
>{
	protected static _instance: PetQuerySchemaServerDatabaseSessionEntry | null = null;
	public static getInstance():PetQuerySchemaServerDatabaseSessionEntry{
		if(this._instance === null){
			this._instance = new PetQuerySchemaServerDatabaseSessionEntry();
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

const petQuerySchemaServerDatabaseSessionEntry = PetQuerySchemaServerDatabaseSessionEntry.getInstance();

export { petQuerySchemaServerDatabaseSessionEntry as PetQuerySchemaServerDatabaseSessionEntry };