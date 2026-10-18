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
import {PetQuerySchemaApiAuthManagedUser} from '#schema/api/auth/user.js';

const schema = {
	...PetQuerySchemaApiAuthManagedUser,
	title:'POST /auth/users response'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersPostResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthUsersPostResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthUsersPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersPostResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersPostResponse();
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

const petQuerySchemaApiAuthUsersPostResponse =
	PetQuerySchemaApiAuthUsersPostResponse.getInstance();

export {
	petQuerySchemaApiAuthUsersPostResponse as
		PetQuerySchemaApiAuthUsersPostResponse
};
