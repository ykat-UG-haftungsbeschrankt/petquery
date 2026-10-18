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

const schema = T.Object({
	 gid:T.String({format:'uuid'})
	,uri:T.String({format:'uri'})
},{
	title:'GET /api/ping/get response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPingGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/ping/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiPingGetResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiPingGetResponseType
>{
	protected static _instance: PetQuerySchemaApiPingGetResponse | null = null;
	public static getInstance():PetQuerySchemaApiPingGetResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiPingGetResponse();
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

const petQuerySchemaApiPingGetResponse = PetQuerySchemaApiPingGetResponse.getInstance();

export { petQuerySchemaApiPingGetResponse as PetQuerySchemaApiPingGetResponse };