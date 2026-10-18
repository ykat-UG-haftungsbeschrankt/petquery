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
	title:'POST /auth/logout response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthLogoutPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthLogoutPostResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthLogoutPostResponseType>{
	protected static _instance:
		PetQuerySchemaApiAuthLogoutPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthLogoutPostResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthLogoutPostResponse();
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

const petQuerySchemaApiAuthLogoutPostResponse =
	PetQuerySchemaApiAuthLogoutPostResponse.getInstance();

export {
	petQuerySchemaApiAuthLogoutPostResponse as
		PetQuerySchemaApiAuthLogoutPostResponse
};
