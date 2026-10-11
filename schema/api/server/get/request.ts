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
	'#petquery/server/response/schema/error.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';
import type {PetQuerySchemaApiServerGetResponse} from
	'#schema/api/server/get/response.js';

const T = PetQuerySchema.type;

// Unknown query parameters are ignored.
const schema = T.Object({
	params:T.Object({}),
	query:T.Object({}),
	body:T.Object({})
},{title:'GET /api/server/get request'});

export type PetQuerySchemaApiServerGetRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/server/get
export class PetQuerySchemaApiServerGetRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaApiServerGetRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

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
