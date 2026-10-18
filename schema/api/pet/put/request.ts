/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaServerDatabasePetEntry} from
	'#schema/server/database/pet/entry.js';
import {
	PetQuerySchemaApiPetPutResponse,
	type PetQuerySchemaApiPetPutResponseType
} from '#schema/api/pet/put/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	...PetQuerySchemaServerDatabasePetEntry.getSchema().properties,
	petId:T.String({minLength:1})
},{
	title:'PUT /api/pets/:petId request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetPutRequest extends PetQueryServerRequestSchema<
	PetQuerySchemaApiPetPutRequestType,
	PetQuerySchemaApiPetPutResponseType
>{
	protected static _instance:PetQuerySchemaApiPetPutRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetPutRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetPutRequest();
		}
		return this._instance;
	}

	getSchema(){
		return schema;
	}

	getValidator(){
		return validator;
	}

	getResponseSchema(){
		return PetQuerySchemaApiPetPutResponse;
	}
};

const petQuerySchemaApiPetPutRequest =
	PetQuerySchemaApiPetPutRequest.getInstance();

export {
	petQuerySchemaApiPetPutRequest as PetQuerySchemaApiPetPutRequest
};
