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
import {PetQuerySchemaApiAuthUser} from '#schema/api/auth/user.js';

const schema = PetQuerySchema.type.Object({
	user:PetQuerySchemaApiAuthUser
},{
	title:'GET /auth/session response',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthSessionGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthSessionGetResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthSessionGetResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthSessionGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthSessionGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthSessionGetResponse();
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

const petQuerySchemaApiAuthSessionGetResponse =
	PetQuerySchemaApiAuthSessionGetResponse.getInstance();

export {
	petQuerySchemaApiAuthSessionGetResponse as
		PetQuerySchemaApiAuthSessionGetResponse
};
