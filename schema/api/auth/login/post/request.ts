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
	PetQuerySchemaApiAuthLoginPostResponse,
	type PetQuerySchemaApiAuthLoginPostResponseType
} from '#schema/api/auth/login/post/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	provider:T.String({minLength:1}),
	username:T.Optional(T.String()),
	password:T.Optional(T.String())
},{
	title:'POST /auth/login request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthLoginPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthLoginPostRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthLoginPostRequestType,
		PetQuerySchemaApiAuthLoginPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthLoginPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthLoginPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthLoginPostRequest();
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
		return PetQuerySchemaApiAuthLoginPostResponse;
	}
};

const petQuerySchemaApiAuthLoginPostRequest =
	PetQuerySchemaApiAuthLoginPostRequest.getInstance();

export {
	petQuerySchemaApiAuthLoginPostRequest as
		PetQuerySchemaApiAuthLoginPostRequest
};
