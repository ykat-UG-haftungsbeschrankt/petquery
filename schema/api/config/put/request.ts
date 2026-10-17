/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import type {PetQuerySchemaApiConfigPutResponseType} from
	'#schema/api/config/put/response.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaApiConfigPutResponse} from
	'#schema/api/config/put/response.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';

const schema = PetQuerySchemaServerDatabaseConfigEntry.getSchema();

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiConfigPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/config/put
class PetQuerySchemaApiConfigPutRequest extends
	PetQueryServerRequestSchema<
		 PetQuerySchemaApiConfigPutRequestType
		,PetQuerySchemaApiConfigPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiConfigPutRequest | null = null;
	public static getInstance():PetQuerySchemaApiConfigPutRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiConfigPutRequest();
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
		return PetQuerySchemaApiConfigPutResponse;
	};
};

const petQuerySchemaApiConfigPutRequest =
	PetQuerySchemaApiConfigPutRequest.getInstance();

export {
	petQuerySchemaApiConfigPutRequest as PetQuerySchemaApiConfigPutRequest
};
