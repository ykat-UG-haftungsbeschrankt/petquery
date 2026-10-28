/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthSetupPostResponse } from '#schema/api/auth/setup/post/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthSetupPostResponseType } from '#schema/api/auth/setup/post/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	username:T.String({pattern:'^[A-Za-z0-9_.@-]{1,128}$'}),
	password:T.String({minLength:8,maxLength:1024})
},{
	title:'POST /auth/setup request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthSetupPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthSetupPostRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthSetupPostRequestType,
		PetQuerySchemaApiAuthSetupPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthSetupPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthSetupPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthSetupPostRequest();
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
		return PetQuerySchemaApiAuthSetupPostResponse;
	}
};

const petQuerySchemaApiAuthSetupPostRequest =
	PetQuerySchemaApiAuthSetupPostRequest.getInstance();

export {
	petQuerySchemaApiAuthSetupPostRequest as
		PetQuerySchemaApiAuthSetupPostRequest
};
