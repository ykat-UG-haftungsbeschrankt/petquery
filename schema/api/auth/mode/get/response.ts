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
import {PetQuerySchemaApiAuthMode} from '#schema/api/auth/user.js';

const schema = PetQuerySchema.type.Object({
	mode:PetQuerySchemaApiAuthMode
},{
	title:'GET /auth/mode response',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthModeGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthModeGetResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiAuthModeGetResponseType
>{
	protected static _instance:PetQuerySchemaApiAuthModeGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthModeGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthModeGetResponse();
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

const petQuerySchemaApiAuthModeGetResponse =
	PetQuerySchemaApiAuthModeGetResponse.getInstance();

export {
	petQuerySchemaApiAuthModeGetResponse as PetQuerySchemaApiAuthModeGetResponse
};
