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
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	// Type the server runs with.
	active:PetQuerySchemaServerDatabaseConfigEntry.getSchema(),
	// Type in the config file, applied on restart; null if none.
	saved:T.Union([PetQuerySchemaServerDatabaseConfigEntry.getSchema(),T.Null()]),
	// Why the config file could not be read, if it could not.
	saved_error:T.Union([T.String(),T.Null()]),
	// Plugin names allowed in route.api.plugins.
	plugins:T.Array(T.String())
},{
	title:'GET /api/config/get response',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiConfigGetResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/config/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaApiConfigGetResponse extends
	PetQueryServerResponseSchema<
		PetQuerySchemaApiConfigGetResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiConfigGetResponse | null = null;
	public static getInstance():PetQuerySchemaApiConfigGetResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiConfigGetResponse();
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

const petQuerySchemaApiConfigGetResponse =
	PetQuerySchemaApiConfigGetResponse.getInstance();

export {
	petQuerySchemaApiConfigGetResponse as PetQuerySchemaApiConfigGetResponse
};
