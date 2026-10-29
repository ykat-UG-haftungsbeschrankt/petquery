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

const T = PetQuerySchema.type;
const schema = T.Object({
	client:PetQuerySchemaApiAuthApiClient,
	token:T.String({minLength:16,maxLength:256})
},{
	title:'POST /auth/api-clients/:id/rotate response',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsRotatePostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsRotatePostResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthApiClientsRotatePostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsRotatePostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsRotatePostResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsRotatePostResponse();
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

const petQuerySchemaApiAuthApiClientsRotatePostResponse =
	PetQuerySchemaApiAuthApiClientsRotatePostResponse.getInstance();

export {
	petQuerySchemaApiAuthApiClientsRotatePostResponse as
		PetQuerySchemaApiAuthApiClientsRotatePostResponse
};
