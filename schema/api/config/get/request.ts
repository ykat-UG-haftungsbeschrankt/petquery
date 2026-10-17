/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import type {PetQuerySchemaApiConfigGetResponseType} from
	'#schema/api/config/get/response.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaApiConfigGetResponse} from
	'#schema/api/config/get/response.js';

const T = PetQuerySchema.type;

const schema = T.Null({
	 title:'GET /api/config/get request'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiConfigGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaApiConfigGetRequest extends
	PetQueryServerRequestSchema<
		 PetQuerySchemaApiConfigGetRequestType
		,PetQuerySchemaApiConfigGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiConfigGetRequest | null = null;
	public static getInstance():PetQuerySchemaApiConfigGetRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiConfigGetRequest();
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
		return PetQuerySchemaApiConfigGetResponse;
	};
};

const petQuerySchemaApiConfigGetRequest =
	PetQuerySchemaApiConfigGetRequest.getInstance();

export {
	petQuerySchemaApiConfigGetRequest as PetQuerySchemaApiConfigGetRequest
};
