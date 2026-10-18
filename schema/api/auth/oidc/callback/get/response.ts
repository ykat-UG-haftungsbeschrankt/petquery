/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerResponseSchema} from
	'#petquery/server/response/schema.js';

const schema = PetQuerySchema.type.Null({
	title:'GET /auth/oidc/callback response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthOidcCallbackGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthOidcCallbackGetResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthOidcCallbackGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthOidcCallbackGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthOidcCallbackGetResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthOidcCallbackGetResponse();
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

const petQuerySchemaApiAuthOidcCallbackGetResponse =
	PetQuerySchemaApiAuthOidcCallbackGetResponse.getInstance();

export {
	petQuerySchemaApiAuthOidcCallbackGetResponse as
		PetQuerySchemaApiAuthOidcCallbackGetResponse
};
