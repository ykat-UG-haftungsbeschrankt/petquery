/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthUser } from '#schema/api/auth/user.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({
	user:PetQuerySchemaApiAuthUser
},{
	title:'POST /auth/login response',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthLoginPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthLoginPostResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthLoginPostResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthLoginPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthLoginPostResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthLoginPostResponse();
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

const petQuerySchemaApiAuthLoginPostResponse =
	PetQuerySchemaApiAuthLoginPostResponse.getInstance();

export {
	petQuerySchemaApiAuthLoginPostResponse as
		PetQuerySchemaApiAuthLoginPostResponse
};
