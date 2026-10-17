/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import type {PetQuerySchemaApiServerPutResponseType} from
	'#schema/api/server/put/response.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	uuid:T.String({format:'uuid'}),
	uri:T.String({format:'uri',maxLength:2048})
},{title:'PUT /api/server/put/:uuid request'});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/server/put/:uuid
class PetQuerySchemaApiServerPutRequest extends
	PetQueryServerRequestSchema<
		 PetQuerySchemaApiServerPutRequestType
		,PetQuerySchemaApiServerPutResponseType
	>{
	protected static _instance:
		PetQuerySchemaApiServerPutRequest | null = null;
	public static getInstance():PetQuerySchemaApiServerPutRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiServerPutRequest();
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
		return PetQuerySchemaApiServerPutResponse;
	};
};

const petQuerySchemaApiServerPutRequest =
	PetQuerySchemaApiServerPutRequest.getInstance();

export {
	petQuerySchemaApiServerPutRequest as PetQuerySchemaApiServerPutRequest
};
