/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClientsRotatePostResponse } from '#schema/api/auth/api-clients/rotate/post/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthApiClientsRotatePostResponseType } from '#schema/api/auth/api-clients/rotate/post/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Object({
	id:T.String({format:'uuid'})
},{
	title:'POST /auth/api-clients/:id/rotate request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsRotatePostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsRotatePostRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthApiClientsRotatePostRequestType,
		PetQuerySchemaApiAuthApiClientsRotatePostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsRotatePostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsRotatePostRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsRotatePostRequest();
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
		return PetQuerySchemaApiAuthApiClientsRotatePostResponse;
	}
};

const petQuerySchemaApiAuthApiClientsRotatePostRequest =
	PetQuerySchemaApiAuthApiClientsRotatePostRequest.getInstance();

export {
	petQuerySchemaApiAuthApiClientsRotatePostRequest as
		PetQuerySchemaApiAuthApiClientsRotatePostRequest
};
