/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import type {PetQuerySchemaApiServerDeleteResponseType} from
	'#schema/api/server/delete/response.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaApiServerDeleteResponse} from
	'#schema/api/server/delete/response.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	uuid:T.String({format:'uuid'})
},{title:'DELETE /api/server/delete/:uuid request'});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerDeleteRequestType =
	PetQuerySchemaStatic<typeof schema>;

// DELETE /api/server/delete/:uuid
class PetQuerySchemaApiServerDeleteRequest extends
	PetQueryServerRequestSchema<
		 PetQuerySchemaApiServerDeleteRequestType
		,PetQuerySchemaApiServerDeleteResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiServerDeleteRequest | null = null;
	public static getInstance():PetQuerySchemaApiServerDeleteRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerDeleteRequest();
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
		return PetQuerySchemaApiServerDeleteResponse;
	};
};

const petQuerySchemaApiServerDeleteRequest =
	PetQuerySchemaApiServerDeleteRequest.getInstance();

export {
	petQuerySchemaApiServerDeleteRequest
		as PetQuerySchemaApiServerDeleteRequest
};
