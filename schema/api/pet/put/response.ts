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
	title:'PUT /api/pets/:pet_id response'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetPutResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiPetPutResponseType
>{
	protected static _instance:PetQuerySchemaApiPetPutResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetPutResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetPutResponse();
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

const petQuerySchemaApiPetPutResponse =
	PetQuerySchemaApiPetPutResponse.getInstance();

export {
	petQuerySchemaApiPetPutResponse as PetQuerySchemaApiPetPutResponse
};
