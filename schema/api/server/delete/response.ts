/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerResponseSchema} from
	'#petquery/server/response/schema.js';

const T = PetQuerySchema.type;

const schema = T.Array(T.Unknown(),{
	title:'DELETE /api/server/delete/:uuid response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerDeleteResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of DELETE /api/server/delete/:uuid. Errors are sent as
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
