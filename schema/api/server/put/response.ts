/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Array(T.Unknown(),{
	title:'PUT /api/server/put/:uid response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of PUT /api/server/put/:uid. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiServerPutResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiServerPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiServerPutResponse | null = null;
	public static getInstance():PetQuerySchemaApiServerPutResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerPutResponse();
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

const petQuerySchemaApiServerPutResponse =
	PetQuerySchemaApiServerPutResponse.getInstance();

export {
	petQuerySchemaApiServerPutResponse as PetQuerySchemaApiServerPutResponse
};
