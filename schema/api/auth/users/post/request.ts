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
import {PetQuerySchemaApiAuthGroup} from '#schema/api/auth/user.js';
import {
	PetQuerySchemaApiAuthUsersPostResponse,
	type PetQuerySchemaApiAuthUsersPostResponseType
} from '#schema/api/auth/users/post/response.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	provider:T.Optional(T.String({minLength:1})),
	username:T.String(),
	displayName:T.String(),
	password:T.String(),
	group:PetQuerySchemaApiAuthGroup
},{
	title:'POST /auth/users request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersPostRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthUsersPostRequestType,
		PetQuerySchemaApiAuthUsersPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthUsersPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersPostRequest();
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
		return PetQuerySchemaApiAuthUsersPostResponse;
	}
};

const petQuerySchemaApiAuthUsersPostRequest =
	PetQuerySchemaApiAuthUsersPostRequest.getInstance();

export {
	petQuerySchemaApiAuthUsersPostRequest as
		PetQuerySchemaApiAuthUsersPostRequest
};
