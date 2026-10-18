/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthOidcCallbackGetResponse } from '#schema/api/auth/oidc/callback/get/response.js';
import { PetQueryServerRequestSchemaAuth } from '#petquery/server/request/schema/auth.js';

import type { PetQuerySchemaApiAuthOidcCallbackGetResponseType } from '#schema/api/auth/oidc/callback/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	code:T.Optional(T.String()),
	state:T.Optional(T.String()),
	error:T.Optional(T.String()),
	error_description:T.Optional(T.String()),
	error_uri:T.Optional(T.String()),
	iss:T.Optional(T.String()),
	session_state:T.Optional(T.String())
},{
	title:'GET /auth/oidc/callback request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthOidcCallbackGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthOidcCallbackGetRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthOidcCallbackGetRequestType,
		PetQuerySchemaApiAuthOidcCallbackGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthOidcCallbackGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthOidcCallbackGetRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthOidcCallbackGetRequest();
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
		return PetQuerySchemaApiAuthOidcCallbackGetResponse;
	}
};

const petQuerySchemaApiAuthOidcCallbackGetRequest =
	PetQuerySchemaApiAuthOidcCallbackGetRequest.getInstance();

export {
	petQuerySchemaApiAuthOidcCallbackGetRequest as
		PetQuerySchemaApiAuthOidcCallbackGetRequest
};
