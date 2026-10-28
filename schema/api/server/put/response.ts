/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeJson } from '#schema/type/json.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaCheck } from '#petquery/schema.js';
import type { PetQuerySchemaTypeJsonType } from '#schema/type/json.js';

const T = PetQuerySchema.type;

const schema = T.Array(PetQuerySchemaTypeJson,{
	title:'PUT /api/server/put/:gid response',
	additionalProperties:false
});

const schemaValidator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerPutResponseType =
	Array<PetQuerySchemaTypeJsonType>;

const validator:PetQuerySchemaCheck<
	PetQuerySchemaApiServerPutResponseType
> = {
	Check(value):value is PetQuerySchemaApiServerPutResponseType{
		return schemaValidator.Check(value);
	},
	Errors(value){
		return schemaValidator.Errors(value);
	}
};

// Successful response of PUT /api/server/put/:gid. Errors are sent as
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
