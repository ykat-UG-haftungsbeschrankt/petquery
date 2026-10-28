/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Null({
	title:'POST /auth/setup response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthSetupPostResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthSetupPostResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthSetupPostResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthSetupPostResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():PetQuerySchemaApiAuthSetupPostResponse{
		if(null === this._instance){
			this._instance = new PetQuerySchemaApiAuthSetupPostResponse();
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

const petQuerySchemaApiAuthSetupPostResponse =
	PetQuerySchemaApiAuthSetupPostResponse.getInstance();

export {
	petQuerySchemaApiAuthSetupPostResponse as
		PetQuerySchemaApiAuthSetupPostResponse
};
