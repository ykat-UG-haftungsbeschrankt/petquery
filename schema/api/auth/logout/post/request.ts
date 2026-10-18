/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthLogoutPostResponse } from '#schema/api/auth/logout/post/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthLogoutPostResponseType } from '#schema/api/auth/logout/post/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({},{
	title:'POST /auth/logout request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthLogoutPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthLogoutPostRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthLogoutPostRequestType,
		PetQuerySchemaApiAuthLogoutPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthLogoutPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthLogoutPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthLogoutPostRequest();
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
		return PetQuerySchemaApiAuthLogoutPostResponse;
	}
};

const petQuerySchemaApiAuthLogoutPostRequest =
	PetQuerySchemaApiAuthLogoutPostRequest.getInstance();

export {
	petQuerySchemaApiAuthLogoutPostRequest as
		PetQuerySchemaApiAuthLogoutPostRequest
};
