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
	title:'GET /api/pets/:pet_id response'
};
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetGetEntryResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetGetEntryResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaApiPetGetEntryResponseType>{
	protected static _instance:PetQuerySchemaApiPetGetEntryResponse|null =
		null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetGetEntryResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetGetEntryResponse();
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

const petQuerySchemaApiPetGetEntryResponse =
	PetQuerySchemaApiPetGetEntryResponse.getInstance();

export {
	petQuerySchemaApiPetGetEntryResponse as PetQuerySchemaApiPetGetEntryResponse
};
