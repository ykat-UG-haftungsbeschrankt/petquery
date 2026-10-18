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

const schema = PetQuerySchema.type.Array(
	PetQuerySchemaServerDatabasePetEntry.getSchema(),
	{title:'GET /api/pets response'}
);
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetGetResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiPetGetResponseType
>{
	protected static _instance:PetQuerySchemaApiPetGetResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetGetResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetGetResponse();
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

const petQuerySchemaApiPetGetResponse =
	PetQuerySchemaApiPetGetResponse.getInstance();

export {
	petQuerySchemaApiPetGetResponse as PetQuerySchemaApiPetGetResponse
};
