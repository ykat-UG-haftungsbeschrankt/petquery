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
	PetQuerySchemaApiPetDeleteResponse,
	type PetQuerySchemaApiPetDeleteResponseType
} from '#schema/api/pet/delete/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	petId:T.String({minLength:1})
},{
	title:'DELETE /api/pets/:petId request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetDeleteRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetDeleteRequest extends PetQueryServerRequestSchema<
	PetQuerySchemaApiPetDeleteRequestType,
	PetQuerySchemaApiPetDeleteResponseType
>{
	protected static _instance:PetQuerySchemaApiPetDeleteRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetDeleteRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetDeleteRequest();
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
		return PetQuerySchemaApiPetDeleteResponse;
	}
};

const petQuerySchemaApiPetDeleteRequest =
	PetQuerySchemaApiPetDeleteRequest.getInstance();

export {
	petQuerySchemaApiPetDeleteRequest as PetQuerySchemaApiPetDeleteRequest
};
