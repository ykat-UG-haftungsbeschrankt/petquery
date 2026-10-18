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
import {
	PetQuerySchemaApiPetGetEntryResponse,
	type PetQuerySchemaApiPetGetEntryResponseType
} from '#schema/api/pet/get/entry/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	pet_id:T.String({minLength:1})
},{
	title:'GET /api/pets/:pet_id request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetGetEntryRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetGetEntryRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiPetGetEntryRequestType,
		PetQuerySchemaApiPetGetEntryResponseType
	>{
	protected static _instance:PetQuerySchemaApiPetGetEntryRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetGetEntryRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetGetEntryRequest();
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
		return PetQuerySchemaApiPetGetEntryResponse;
	}
};

const petQuerySchemaApiPetGetEntryRequest =
	PetQuerySchemaApiPetGetEntryRequest.getInstance();

export {
	petQuerySchemaApiPetGetEntryRequest as PetQuerySchemaApiPetGetEntryRequest
};
