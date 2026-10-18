/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetGetResponse } from '#schema/api/pet/get/response.js';
import { PetQuerySchemaPluginFile } from '#schema/plugin/file.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPetGetResponseType } from '#schema/api/pet/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	query:T.String({minLength:1,pattern:'\\S'}),
	files:T.Optional(T.Array(PetQuerySchemaPluginFile.getSchema())),
	tracerouteUuid:T.Optional(T.Array(T.String({format:'uuid'})))
},{
	title:'POST /api/pets/search request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetSearchRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetSearchRequest extends PetQueryServerRequestSchema<
	PetQuerySchemaApiPetSearchRequestType,
	PetQuerySchemaApiPetGetResponseType
>{
	protected static _instance:PetQuerySchemaApiPetSearchRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetSearchRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetSearchRequest();
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

const petQuerySchemaApiPetSearchRequest =
	PetQuerySchemaApiPetSearchRequest.getInstance();

export {
	petQuerySchemaApiPetSearchRequest as PetQuerySchemaApiPetSearchRequest
};
