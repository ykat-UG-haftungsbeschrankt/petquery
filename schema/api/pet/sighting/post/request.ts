/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetGetEntryResponse } from '#schema/api/pet/get/entry/response.js';
import { PetQuerySchemaTypeLastSeen } from '#schema/type/last/seen.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPetGetEntryResponseType } from '#schema/api/pet/get/entry/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	gid:T.String({minLength:1}),
	last_seen:PetQuerySchemaTypeLastSeen
},{
	title:'POST /api/pets/:gid/sightings request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetSightingPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetSightingPostRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiPetSightingPostRequestType,
		PetQuerySchemaApiPetGetEntryResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiPetSightingPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetSightingPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetSightingPostRequest();
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

const petQuerySchemaApiPetSightingPostRequest =
	PetQuerySchemaApiPetSightingPostRequest.getInstance();

export {
	petQuerySchemaApiPetSightingPostRequest as
		PetQuerySchemaApiPetSightingPostRequest
};
