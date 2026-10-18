/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerResponseSchema} from
	'#petquery/server/response/schema.js';
import {PetQuerySchemaServerDatabasePetEntry} from
	'#schema/server/database/pet/entry.js';

const schema = {
	...PetQuerySchemaServerDatabasePetEntry.getSchema(),
	title:'POST /api/pets response'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetPostResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiPetPostResponseType
>{
	protected static _instance:PetQuerySchemaApiPetPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetPostResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetPostResponse();
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

const petQuerySchemaApiPetPostResponse =
	PetQuerySchemaApiPetPostResponse.getInstance();

export {
	petQuerySchemaApiPetPostResponse as PetQuerySchemaApiPetPostResponse
};
