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
	title:'PUT /auth/users/:username response'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthUsersPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthUsersPutResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiAuthUsersPutResponseType>{
	protected static _instance:PetQuerySchemaApiAuthUsersPutResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthUsersPutResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthUsersPutResponse();
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

const petQuerySchemaApiAuthUsersPutResponse =
	PetQuerySchemaApiAuthUsersPutResponse.getInstance();

export {
	petQuerySchemaApiAuthUsersPutResponse as
		PetQuerySchemaApiAuthUsersPutResponse
};
