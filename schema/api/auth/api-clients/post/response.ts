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

const schema = PetQuerySchema.type.Object({
	client:PetQuerySchemaApiAuthApiClient,
	token:PetQuerySchema.type.String({minLength:16,maxLength:256})
},{
	title:'POST /auth/api-clients response',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsPostResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthApiClientsPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsPostResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsPostResponse();
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

const petQuerySchemaApiAuthApiClientsPostResponse =
	PetQuerySchemaApiAuthApiClientsPostResponse.getInstance();

export {
	petQuerySchemaApiAuthApiClientsPostResponse as
		PetQuerySchemaApiAuthApiClientsPostResponse
};
