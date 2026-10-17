/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import {PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	 sessionId:T.String({sessionId:'uuid'})
	,createdTs:T.Number()
	,expiredTs:T.Number()
},{
	title:'Search response of /api and /json',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabaseSessionEntryType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/ping/get. Errors are sent as
// PetQueryServerResponseSchemaError.
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