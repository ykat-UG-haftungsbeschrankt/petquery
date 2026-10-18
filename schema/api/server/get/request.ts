/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiServerGetResponse } from '#schema/api/server/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiServerGetResponseType } from '#schema/api/server/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({},{
	 title:'GET /api/Server/get request'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/Server/get
class PetQuerySchemaApiServerGetRequest extends PetQueryServerRequestSchema<
	 PetQuerySchemaApiServerGetRequestType
	,PetQuerySchemaApiServerGetResponseType
>{
	protected static _instance: PetQuerySchemaApiServerGetRequest | null = null;
	public static getInstance():PetQuerySchemaApiServerGetRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerGetRequest();
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
		return PetQuerySchemaApiServerGetResponse;
	};
};

const petQuerySchemaApiServerGetRequest = PetQuerySchemaApiServerGetRequest.getInstance();

export { petQuerySchemaApiServerGetRequest as PetQuerySchemaApiServerGetRequest };