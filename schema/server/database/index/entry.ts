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
	gid:T.String({format:'uuid'}),
	uri:T.String({format:'uri'}),
	adminContact:T.String({maxLength:1024}),
	companyAddress:T.String({maxLength:4096}),
	pingTimeMs:T.Integer({minimum:0}),
	addedAt:T.String({format:'date-time'}),
	updatedAt:T.String({format:'date-time'}),
	lastPingAt:T.String({format:'date-time'})
},{
	title:'Server index entry',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabaseIndexEntryType =
	PetQuerySchemaStatic<typeof schema>;

// Describes a known peer and the metadata shared through index sync.
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