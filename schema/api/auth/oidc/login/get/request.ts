/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthOidcLoginGetResponse } from '#schema/api/auth/oidc/login/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthOidcLoginGetResponseType } from '#schema/api/auth/oidc/login/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /auth/oidc/login request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthOidcLoginGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthOidcLoginGetRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthOidcLoginGetRequestType,
		PetQuerySchemaApiAuthOidcLoginGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthOidcLoginGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthOidcLoginGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthOidcLoginGetRequest();
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
		return PetQuerySchemaApiAuthOidcLoginGetResponse;
	}
};

const petQuerySchemaApiAuthOidcLoginGetRequest =
	PetQuerySchemaApiAuthOidcLoginGetRequest.getInstance();

export {
	petQuerySchemaApiAuthOidcLoginGetRequest as
		PetQuerySchemaApiAuthOidcLoginGetRequest
};
