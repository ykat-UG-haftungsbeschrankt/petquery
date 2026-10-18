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
	 uid:T.String({format:'uuid'})
	,uri:T.String({format:'uri'})
},{
	title:'Search response of /api and /json',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabaseIndexEntryType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/ping/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaServerDatabaseIndexEntry extends PetQuerySchemaAbstract<
	PetQuerySchemaServerDatabaseIndexEntryType
>{
	protected static _instance: PetQuerySchemaServerDatabaseIndexEntry | null = null;
	public static getInstance():PetQuerySchemaServerDatabaseIndexEntry{
		if(this._instance === null){
			this._instance = new PetQuerySchemaServerDatabaseIndexEntry();
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

const petQuerySchemaServerDatabaseIndexEntry = PetQuerySchemaServerDatabaseIndexEntry.getInstance();

export { petQuerySchemaServerDatabaseIndexEntry as PetQuerySchemaServerDatabaseIndexEntry };