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

const schema = PetQuerySchema.type.Array(
	PetQuerySchemaApiAuthApiClient,
	{title:'GET /auth/api-clients response'}
);
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsGetResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthApiClientsGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsGetResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsGetResponse();
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

const petQuerySchemaApiAuthApiClientsGetResponse =
	PetQuerySchemaApiAuthApiClientsGetResponse.getInstance();

export {
	petQuerySchemaApiAuthApiClientsGetResponse as
		PetQuerySchemaApiAuthApiClientsGetResponse
};
