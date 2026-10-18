/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthModeGetResponse } from '#schema/api/auth/mode/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthModeGetResponseType } from '#schema/api/auth/mode/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /auth/mode request',
	additionalProperties:true
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthModeGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthModeGetRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthModeGetRequestType,
		PetQuerySchemaApiAuthModeGetResponseType
	>{
	protected static _instance:PetQuerySchemaApiAuthModeGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthModeGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthModeGetRequest();
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
		return PetQuerySchemaApiAuthModeGetResponse;
	}
};

const petQuerySchemaApiAuthModeGetRequest =
	PetQuerySchemaApiAuthModeGetRequest.getInstance();

export {
	petQuerySchemaApiAuthModeGetRequest as PetQuerySchemaApiAuthModeGetRequest
};
