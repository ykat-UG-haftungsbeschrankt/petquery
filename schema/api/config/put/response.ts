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
import {PetQueryServerConfig} from '#petquery/server/config.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	// The values as saved, applied on restart.
	saved:PetQueryServerConfig.schema
},{
	title:'PUT /api/config/put response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiConfigPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of PUT /api/config/put. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiConfigPutResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiConfigPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiConfigPutResponse | null = null;
	public static getInstance():PetQuerySchemaApiConfigPutResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiConfigPutResponse();
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

const petQuerySchemaApiConfigPutResponse =
	PetQuerySchemaApiConfigPutResponse.getInstance();

export {
	petQuerySchemaApiConfigPutResponse as PetQuerySchemaApiConfigPutResponse
};
