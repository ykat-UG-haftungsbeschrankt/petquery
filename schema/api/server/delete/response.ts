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
	title:'DELETE /api/server/delete/:gid response',
	additionalProperties:false
});

const schemaValidator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerDeleteResponseType =
	Array<PetQuerySchemaTypeJsonType>;

const validator:PetQuerySchemaCheck<
	PetQuerySchemaApiServerDeleteResponseType
> = {
	Check(value):value is PetQuerySchemaApiServerDeleteResponseType{
		return schemaValidator.Check(value);
	},
	Errors(value){
		return schemaValidator.Errors(value);
	}
};

// Successful response of DELETE /api/server/delete/:gid. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiServerDeleteResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiServerDeleteResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiServerDeleteResponse | null = null;
	public static getInstance():PetQuerySchemaApiServerDeleteResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerDeleteResponse();
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

const petQuerySchemaApiServerDeleteResponse =
	PetQuerySchemaApiServerDeleteResponse.getInstance();

export {
	petQuerySchemaApiServerDeleteResponse
		as PetQuerySchemaApiServerDeleteResponse
};
