/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiServerPutResponse } from '#schema/api/server/put/response.js';
import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';

import type { PetQuerySchemaApiServerPutResponseType } from '#schema/api/server/put/response.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	gid:T.String({format:'uuid'}),
	uri:T.String({format:'uri',maxLength:2048}),
	adminContact:T.String({maxLength:1024}),
	companyAddress:T.String({maxLength:4096}),
	pingTimeMs:T.Integer({minimum:0}),
	addedAt:T.String({format:'date-time'}),
	updatedAt:T.String({format:'date-time'}),
	lastPingAt:T.String({format:'date-time'})
},{title:'PUT /api/server/put/:gid request'});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiServerPutRequestType =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/server/put/:gid
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
