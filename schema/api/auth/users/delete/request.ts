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
	PetQuerySchemaApiAuthUsersDeleteResponse,
	type PetQuerySchemaApiAuthUsersDeleteResponseType
} from '#schema/api/auth/users/delete/response.js';

const schema = PetQuerySchema.type.Object({
	username:PetQuerySchema.type.String({minLength:1}),
	provider:PetQuerySchema.type.Optional(
		PetQuerySchema.type.String({minLength:1})
	)
},{
	title:'DELETE /auth/users/:username request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersDeleteRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersDeleteRequest extends
	PetQueryServerRequestSchemaAuth<
		PetQuerySchemaApiAuthUsersDeleteRequestType,
		PetQuerySchemaApiAuthUsersDeleteResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthUsersDeleteRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersDeleteRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersDeleteRequest();
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
		return PetQuerySchemaApiAuthUsersDeleteResponse;
	}
};

const petQuerySchemaApiAuthUsersDeleteRequest =
	PetQuerySchemaApiAuthUsersDeleteRequest.getInstance();

export {
	petQuerySchemaApiAuthUsersDeleteRequest as
		PetQuerySchemaApiAuthUsersDeleteRequest
};
