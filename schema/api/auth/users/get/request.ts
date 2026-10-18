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
	PetQuerySchemaApiAuthUsersGetResponse,
	type PetQuerySchemaApiAuthUsersGetResponseType
} from '#schema/api/auth/users/get/response.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /auth/users request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersGetRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthUsersGetRequestType,
		PetQuerySchemaApiAuthUsersGetResponseType
	>{
	protected static _instance:PetQuerySchemaApiAuthUsersGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersGetRequest();
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
		return PetQuerySchemaApiAuthUsersGetResponse;
	}
};

const petQuerySchemaApiAuthUsersGetRequest =
	PetQuerySchemaApiAuthUsersGetRequest.getInstance();

export {
	petQuerySchemaApiAuthUsersGetRequest as PetQuerySchemaApiAuthUsersGetRequest
};
