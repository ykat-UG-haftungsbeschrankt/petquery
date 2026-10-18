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

const schema = PetQuerySchema.type.Null({
	title:'DELETE /api/pets/:petId response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiPetDeleteResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiPetDeleteResponse extends PetQueryServerResponseSchema<
	PetQuerySchemaApiPetDeleteResponseType
>{
	protected static _instance:PetQuerySchemaApiPetDeleteResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiPetDeleteResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiPetDeleteResponse();
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

const petQuerySchemaApiPetDeleteResponse =
	PetQuerySchemaApiPetDeleteResponse.getInstance();

export {
	petQuerySchemaApiPetDeleteResponse as PetQuerySchemaApiPetDeleteResponse
};
