/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Array(
	PetQuerySchemaServerDatabasePetEntry.getSchema(),
	{title:'POST /api/pets/search response'}
);
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetSearchResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetSearchResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiPetSearchResponseType>{
	protected static _instance:
		PetQuerySchemaApiPetSearchResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetSearchResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetSearchResponse();
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

const petQuerySchemaApiPetSearchResponse =
	PetQuerySchemaApiPetSearchResponse.getInstance();

export {
	petQuerySchemaApiPetSearchResponse as PetQuerySchemaApiPetSearchResponse
};
