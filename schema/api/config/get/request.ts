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
import type {PetQuerySchemaApiConfigGetResponse} from
	'#schema/api/config/get/response.js';

const schema = PetQuerySchema.emptyRequest(
	'GET /api/config/get request'
);

export type PetQuerySchemaApiConfigGetRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
export class PetQuerySchemaApiConfigGetRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaApiConfigGetRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiConfigGetRequest{
		return new PetQuerySchemaApiConfigGetRequest(
			PetQuerySchema.parse(PetQuerySchemaApiConfigGetRequest._validator,json)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiConfigGetRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiConfigGetRequest
		)=>Promise<
			PetQuerySchemaApiConfigGetResponse|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaApiConfigGetRequest.fromJson,
			handler,
			req,
			res
		);
	}
};
