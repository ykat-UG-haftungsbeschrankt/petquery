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
	petId:T.String({petId:'uuid'}),
	name:T.String({minLength:1,maxLength:256}),
	species:T.String({minLength:1,maxLength:256}),
	owner_contact:T.String({maxLength:4096}),
	notes:T.String({maxLength:65536}),
	source:T.Object({
		favicon:T.String(),
		url:T.String(),
		name:T.String()
	},{additionalProperties:false}),
	preview:T.String(),
	files:T.Array(T.String()),
	attributes:T.Array(T.Object({
		key:T.String(),
		value:T.String()
	},{additionalProperties:false}))
},{
	title:'Search response of /api and /json',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabasePetEntryType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/ping/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaServerDatabasePetEntry extends PetQuerySchemaAbstract<
	PetQuerySchemaServerDatabasePetEntryType
>{
	protected static _instance: PetQuerySchemaServerDatabasePetEntry | null = null;
	public static getInstance():PetQuerySchemaServerDatabasePetEntry{
		if(this._instance === null){
			this._instance = new PetQuerySchemaServerDatabasePetEntry();
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

const petQuerySchemaServerDatabasePetEntry = PetQuerySchemaServerDatabasePetEntry.getInstance();

export { petQuerySchemaServerDatabasePetEntry as PetQuerySchemaServerDatabasePetEntry };