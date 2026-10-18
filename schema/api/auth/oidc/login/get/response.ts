/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Null({
	title:'GET /auth/oidc/login response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthOidcLoginGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthOidcLoginGetResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthOidcLoginGetResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthOidcLoginGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthOidcLoginGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthOidcLoginGetResponse();
		}
		return this._instance;
	}

	getSchema(){
		return schema;
	}

	getValidator(){
		return validator;
	}
};

const petQuerySchemaApiAuthOidcLoginGetResponse =
	PetQuerySchemaApiAuthOidcLoginGetResponse.getInstance();

export {
	petQuerySchemaApiAuthOidcLoginGetResponse as
		PetQuerySchemaApiAuthOidcLoginGetResponse
};
