/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPingGetResponse } from '#schema/api/ping/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPingGetResponseType } from '#schema/api/ping/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({},{
	 title:'GET /api/ping/get request'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPingGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/ping/get
class PetQuerySchemaApiPingGetRequest extends PetQueryServerRequestSchema<
	 PetQuerySchemaApiPingGetRequestType
	,PetQuerySchemaApiPingGetResponseType
>{
	protected static _instance: PetQuerySchemaApiPingGetRequest | null = null;
	public static getInstance():PetQuerySchemaApiPingGetRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiPingGetRequest();
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
		return PetQuerySchemaApiPingGetResponse;
	};
};

const petQuerySchemaApiPingGetRequest = PetQuerySchemaApiPingGetRequest.getInstance();

export { petQuerySchemaApiPingGetRequest as PetQuerySchemaApiPingGetRequest };