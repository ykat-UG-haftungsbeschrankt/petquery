/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthGroup } from '#schema/api/auth/user.js';
import { PetQuerySchemaApiAuthUsersPutResponse } from '#schema/api/auth/users/put/response.js';
import { PetQueryServerRequestSchemaAuth } from '#petquery/server/request/schema/auth.js';

import type { PetQuerySchemaApiAuthUsersPutResponseType } from '#schema/api/auth/users/put/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	provider:T.Optional(T.String({minLength:1})),
	username:T.String({minLength:1}),
	displayName:T.String(),
	password:T.String(),
	group:PetQuerySchemaApiAuthGroup
},{
	title:'PUT /auth/users/:username request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersPutRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthUsersPutRequestType,
		PetQuerySchemaApiAuthUsersPutResponseType
	>{
	protected static _instance:PetQuerySchemaApiAuthUsersPutRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersPutRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersPutRequest();
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
		return PetQuerySchemaApiAuthUsersPutResponse;
	}
};

const petQuerySchemaApiAuthUsersPutRequest =
	PetQuerySchemaApiAuthUsersPutRequest.getInstance();

export {
	petQuerySchemaApiAuthUsersPutRequest as PetQuerySchemaApiAuthUsersPutRequest
};
