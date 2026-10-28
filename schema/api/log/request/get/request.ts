/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiLogRequestGetResponse } from '#schema/api/log/request/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiLogRequestGetResponseType } from '#schema/api/log/request/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	query:T.Optional(T.String({minLength:1,maxLength:256})),
	limit:T.Optional(T.String({
		pattern:'^(?:[1-9]|[1-9][0-9]|[1-4][0-9]{2}|500)$',
		maxLength:3
	}))
},{
	title:'GET /api/log/request/get request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiLogRequestGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiLogRequestGetRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiLogRequestGetRequestType,
		PetQuerySchemaApiLogRequestGetResponseType
	>{
	protected static _instance:PetQuerySchemaApiLogRequestGetRequest|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiLogRequestGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiLogRequestGetRequest();
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
		return PetQuerySchemaApiLogRequestGetResponse;
	}
};

const petQuerySchemaApiLogRequestGetRequest =
	PetQuerySchemaApiLogRequestGetRequest.getInstance();

export {
	petQuerySchemaApiLogRequestGetRequest as
		PetQuerySchemaApiLogRequestGetRequest
};
