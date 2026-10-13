/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import type {PetQueryServerRequestSchemaInput} from
	'#petquery/server/request/schema.js';
import type {PetQueryServerResponseSchemaError} from
	'#petquery/server/response/schema.js';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';
import type {PetQuerySchemaApiConfigPutResponse} from
	'#schema/api/config/put/response.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerConfigValues} from
	'#petquery/server/config.js';

const T = PetQuerySchema.type;

// Unknown query parameters are ignored.
const schema = T.Object({
	params:T.Object({}),
	query:T.Object({}),
	body:PetQueryServerConfig.schema
},{title:'PUT /api/config/put request'});

export type PetQuerySchemaApiConfigPutRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/config/put
export class PetQuerySchemaApiConfigPutRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaApiConfigPutRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiConfigPutRequest{
		return new PetQuerySchemaApiConfigPutRequest(
			PetQuerySchema.parse(PetQuerySchemaApiConfigPutRequest._validator,json)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiConfigPutRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiConfigPutRequest
		)=>Promise<
			PetQuerySchemaApiConfigPutResponse|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaApiConfigPutRequest.fromJson,
			handler,
			req,
			res
		);
	}

	getConfig():PetQueryServerConfigValues{
		return this._values.body;
	}
};
