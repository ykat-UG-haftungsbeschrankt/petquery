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

const T = PetQuerySchema.type;
const schema = T.Array(PetQuerySchemaTypeLogEntry,{
	title:'GET /api/log/level/get response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiLogLevelGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiLogLevelGetResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiLogLevelGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiLogLevelGetResponse|null = null;

	public static getInstance():PetQuerySchemaApiLogLevelGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiLogLevelGetResponse();
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

const petQuerySchemaApiLogLevelGetResponse =
	PetQuerySchemaApiLogLevelGetResponse.getInstance();

export {
	petQuerySchemaApiLogLevelGetResponse as
		PetQuerySchemaApiLogLevelGetResponse
};
