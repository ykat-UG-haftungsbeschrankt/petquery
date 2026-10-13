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
import {PetQuerySchemaApiServerGetResponse} from
	'#schema/api/server/get/response.js';

const schema = PetQuerySchema.emptyRequest(
	'GET /api/server/get request'
);

export type PetQuerySchemaApiServerGetRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/server/get
export class PetQuerySchemaApiServerGetRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaApiServerGetRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	static async fetch(
		uri:uri_t,
		timeout:milliseconds_t,
		signal:AbortSignal
	):Promise<PetQuerySchemaApiServerGetResponse>{
		const result = await PetQueryServerRequestSchema._fetchJson(
			uri,
			'api/server/get',
			timeout,
			signal
		);
		return PetQuerySchemaApiServerGetResponse.fromJson(
			result.status,
			result.json
		);
	}

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiServerGetRequest{
		return new PetQuerySchemaApiServerGetRequest(
			PetQuerySchema.parse(PetQuerySchemaApiServerGetRequest._validator,json)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiServerGetRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiServerGetRequest
		)=>Promise<
			PetQuerySchemaApiServerGetResponse|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaApiServerGetRequest.fromJson,
			handler,
			req,
			res
		);
	}
};
