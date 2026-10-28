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
	title:'DELETE /auth/api-clients/:id response'
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsDeleteResponseType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsDeleteResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiAuthApiClientsDeleteResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsDeleteResponse|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsDeleteResponse{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsDeleteResponse();
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

const petQuerySchemaApiAuthApiClientsDeleteResponse =
	PetQuerySchemaApiAuthApiClientsDeleteResponse.getInstance();

export {
	petQuerySchemaApiAuthApiClientsDeleteResponse as
		PetQuerySchemaApiAuthApiClientsDeleteResponse
};
