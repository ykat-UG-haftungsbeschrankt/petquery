/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetGetResponse } from '#schema/api/pet/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPetGetResponseType } from '#schema/api/pet/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /api/pets request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetGetRequest extends PetQueryServerRequestSchema<
	PetQuerySchemaApiPetGetRequestType,
	PetQuerySchemaApiPetGetResponseType
>{
	protected static _instance:PetQuerySchemaApiPetGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetGetRequest();
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
		return PetQuerySchemaApiPetGetResponse;
	}
};

const petQuerySchemaApiPetGetRequest =
	PetQuerySchemaApiPetGetRequest.getInstance();

export {
	petQuerySchemaApiPetGetRequest as PetQuerySchemaApiPetGetRequest
};
