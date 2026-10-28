/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClientSettings } from '#schema/api/auth/api-client.js';
import { PetQuerySchemaApiAuthApiClientsPutResponse } from '#schema/api/auth/api-clients/put/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthApiClientsPutResponseType } from '#schema/api/auth/api-clients/put/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	id:T.String({format:'uuid'}),
	...PetQuerySchemaApiAuthApiClientSettings.properties
},{
	title:'PUT /auth/api-clients/:id request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsPutRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthApiClientsPutRequestType,
		PetQuerySchemaApiAuthApiClientsPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsPutRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthApiClientsPutRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsPutRequest();
		}
		return this._instance;
	}

	getSchema(){
		return schema;
	}

	getValidator(){
		return validator;
	}

	getResponseSchema(){
		return PetQuerySchemaApiAuthApiClientsPutResponse;
	}
};

const petQuerySchemaApiAuthApiClientsPutRequest =
	PetQuerySchemaApiAuthApiClientsPutRequest.getInstance();

export {
	petQuerySchemaApiAuthApiClientsPutRequest as
		PetQuerySchemaApiAuthApiClientsPutRequest
};
