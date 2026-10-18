/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerRequestSchemaAuth} from
	'#petquery/server/request/schema/auth.js';
import {
	PetQuerySchemaApiAuthSessionGetResponse,
	type PetQuerySchemaApiAuthSessionGetResponseType
} from '#schema/api/auth/session/get/response.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /auth/session request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthSessionGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthSessionGetRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthSessionGetRequestType,
		PetQuerySchemaApiAuthSessionGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthSessionGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthSessionGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthSessionGetRequest();
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
		return PetQuerySchemaApiAuthSessionGetResponse;
	}
};

const petQuerySchemaApiAuthSessionGetRequest =
	PetQuerySchemaApiAuthSessionGetRequest.getInstance();

export {
	petQuerySchemaApiAuthSessionGetRequest as
		PetQuerySchemaApiAuthSessionGetRequest
};
