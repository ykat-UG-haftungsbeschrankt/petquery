/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetGetEntryResponse } from '#schema/api/pet/get/entry/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPetGetEntryResponseType } from '#schema/api/pet/get/entry/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	gid:T.String({minLength:1})
},{
	title:'GET /api/pets/:gid request',
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
