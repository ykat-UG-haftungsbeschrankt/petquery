/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeServer } from '#schema/type/server.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = {
	...PetQuerySchemaTypeServer,
	title:'GET /api/ping/get response'
};

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