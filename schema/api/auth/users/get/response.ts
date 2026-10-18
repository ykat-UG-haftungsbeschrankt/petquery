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

const schema = PetQuerySchema.type.Array(
	PetQuerySchemaApiAuthManagedUser,
	{title:'GET /auth/users response'}
);
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersGetResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthUsersGetResponseType>{
	protected static _instance:PetQuerySchemaApiAuthUsersGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersGetResponse();
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

const petQuerySchemaApiAuthUsersGetResponse =
	PetQuerySchemaApiAuthUsersGetResponse.getInstance();

export {
	petQuerySchemaApiAuthUsersGetResponse as
		PetQuerySchemaApiAuthUsersGetResponse
};
