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

const schema = T.Array(
	T.Object({
		uid:T.String({format:'uuid'}),
		uri:T.String({format:'uri'})
	})
,{
	title:'GET /api/server/get response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/Server/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiServerGetResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiServerGetResponseType
>{
	protected static _instance: PetQuerySchemaApiServerGetResponse | null = null;
	public static getInstance():PetQuerySchemaApiServerGetResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerGetResponse();
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

const petQuerySchemaApiServerGetResponse = PetQuerySchemaApiServerGetResponse.getInstance();

export { petQuerySchemaApiServerGetResponse as PetQuerySchemaApiServerGetResponse };