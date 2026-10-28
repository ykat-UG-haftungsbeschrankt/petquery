/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiLogLevelGetResponse } from '#schema/api/log/level/get/response.js';
import { PetQuerySchemaTypeLogLevel } from '#schema/type/log/level.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiLogLevelGetResponseType } from '#schema/api/log/level/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	level:T.Optional(PetQuerySchemaTypeLogLevel),
	query:T.Optional(T.String({minLength:1,maxLength:256})),
	limit:T.Optional(T.String({
		pattern:'^(?:[1-9]|[1-9][0-9]|[1-4][0-9]{2}|500)$',
		maxLength:3
	}))
},{
	title:'GET /api/log/level/get request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiLogLevelGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiLogLevelGetRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiLogLevelGetRequestType,
		PetQuerySchemaApiLogLevelGetResponseType
	>{
	protected static _instance:PetQuerySchemaApiLogLevelGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiLogLevelGetRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiLogLevelGetRequest();
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
		return PetQuerySchemaApiLogLevelGetResponse;
	}
};

const petQuerySchemaApiLogLevelGetRequest =
	PetQuerySchemaApiLogLevelGetRequest.getInstance();

export {
	petQuerySchemaApiLogLevelGetRequest as PetQuerySchemaApiLogLevelGetRequest
};
