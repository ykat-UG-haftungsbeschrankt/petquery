/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClientSettings } from '#schema/api/auth/api-client.js';
import { PetQuerySchemaApiAuthApiClientsPostResponse } from '#schema/api/auth/api-clients/post/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthApiClientsPostResponseType } from '#schema/api/auth/api-clients/post/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchemaApiAuthApiClientSettings;
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsPostRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthApiClientsPostRequestType,
		PetQuerySchemaApiAuthApiClientsPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthApiClientsPostRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsPostRequest();
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
		return PetQuerySchemaApiAuthApiClientsPostResponse;
	}
};

const petQuerySchemaApiAuthApiClientsPostRequest =
	PetQuerySchemaApiAuthApiClientsPostRequest.getInstance();

export {
	petQuerySchemaApiAuthApiClientsPostRequest as
		PetQuerySchemaApiAuthApiClientsPostRequest
};
