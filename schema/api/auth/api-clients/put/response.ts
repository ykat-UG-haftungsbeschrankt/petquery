/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClient } from '#schema/api/auth/api-client.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchemaApiAuthApiClient;
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsPutResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthApiClientsPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsPutResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsPutResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsPutResponse();
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

const petQuerySchemaApiAuthApiClientsPutResponse =
	PetQuerySchemaApiAuthApiClientsPutResponse.getInstance();

export {
	petQuerySchemaApiAuthApiClientsPutResponse as
		PetQuerySchemaApiAuthApiClientsPutResponse
};
