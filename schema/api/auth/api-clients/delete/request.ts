/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiAuthApiClientsDeleteResponse } from '#schema/api/auth/api-clients/delete/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiAuthApiClientsDeleteResponseType } from '#schema/api/auth/api-clients/delete/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({
	id:PetQuerySchema.type.String({format:'uuid'})
},{
	title:'DELETE /auth/api-clients/:id request',
	additionalProperties:false
});
const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiAuthApiClientsDeleteRequestType =
	PetQuerySchemaStatic<typeof schema>;

class PetQuerySchemaApiAuthApiClientsDeleteRequest extends
	PetQueryServerRequestSchema<
		PetQuerySchemaApiAuthApiClientsDeleteRequestType,
		PetQuerySchemaApiAuthApiClientsDeleteResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiAuthApiClientsDeleteRequest|null = null;

	private constructor(){
		super();
	}

	public static getInstance():
		PetQuerySchemaApiAuthApiClientsDeleteRequest{
		if(null === this._instance){
			this._instance =
				new PetQuerySchemaApiAuthApiClientsDeleteRequest();
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
		return PetQuerySchemaApiAuthApiClientsDeleteResponse;
	}
};

const petQuerySchemaApiAuthApiClientsDeleteRequest =
	PetQuerySchemaApiAuthApiClientsDeleteRequest.getInstance();

export {
	petQuerySchemaApiAuthApiClientsDeleteRequest as
		PetQuerySchemaApiAuthApiClientsDeleteRequest
};
