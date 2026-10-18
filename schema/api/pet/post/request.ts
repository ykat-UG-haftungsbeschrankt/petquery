/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetPostResponse } from '#schema/api/pet/post/response.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiPetPostResponseType } from '#schema/api/pet/post/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = {
	...PetQuerySchemaServerDatabasePetEntry.getSchema(),
	title:'POST /api/pets request'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetPostRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetPostRequest extends PetQueryServerRequestSchema<
	PetQuerySchemaApiPetPostRequestType,
	PetQuerySchemaApiPetPostResponseType
>{
	protected static _instance:PetQuerySchemaApiPetPostRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetPostRequest{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetPostRequest();
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
		return PetQuerySchemaApiPetPostResponse;
	}
};

const petQuerySchemaApiPetPostRequest =
	PetQuerySchemaApiPetPostRequest.getInstance();

export {
	petQuerySchemaApiPetPostRequest as PetQuerySchemaApiPetPostRequest
};
