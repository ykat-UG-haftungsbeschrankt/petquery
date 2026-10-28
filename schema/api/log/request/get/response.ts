/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeLogEntry } from '#schema/type/log/entry.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Array(
	PetQuerySchemaTypeLogEntry,
	{title:'GET /api/log/request/get response'}
);
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiLogRequestGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiLogRequestGetResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiLogRequestGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiLogRequestGetResponse|null = null;

	public static getInstance():PetQuerySchemaApiLogRequestGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiLogRequestGetResponse();
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

const petQuerySchemaApiLogRequestGetResponse =
	PetQuerySchemaApiLogRequestGetResponse.getInstance();

export {
	petQuerySchemaApiLogRequestGetResponse as
		PetQuerySchemaApiLogRequestGetResponse
};
