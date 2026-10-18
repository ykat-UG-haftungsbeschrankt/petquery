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

const schema = PetQuerySchema.type.Null({
	title:'DELETE /auth/users/:username response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersDeleteResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersDeleteResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthUsersDeleteResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthUsersDeleteResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersDeleteResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersDeleteResponse();
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

const petQuerySchemaApiAuthUsersDeleteResponse =
	PetQuerySchemaApiAuthUsersDeleteResponse.getInstance();

export {
	petQuerySchemaApiAuthUsersDeleteResponse as
		PetQuerySchemaApiAuthUsersDeleteResponse
};
