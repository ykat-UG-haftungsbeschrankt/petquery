/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClientsGetResponse } from '#schema/api/auth/api-clients/get/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthApiClientsGetResponseType } from '#schema/api/auth/api-clients/get/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({},{
	title:'GET /auth/api-clients request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsGetRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsGetRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthApiClientsGetRequestType,
		PetQuerySchemaApiAuthApiClientsGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsGetRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthApiClientsGetRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsGetRequest();
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
		return PetQuerySchemaApiAuthApiClientsGetResponse;
	}
};

const petQuerySchemaApiAuthApiClientsGetRequest =
	PetQuerySchemaApiAuthApiClientsGetRequest.getInstance();

export {
	petQuerySchemaApiAuthApiClientsGetRequest as
		PetQuerySchemaApiAuthApiClientsGetRequest
};
