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
import type {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';

const T = PetQuerySchema.type;

// Unknown query parameters are ignored.
const schema = T.Object({
	params:T.Object({
		uuid:T.String({format:'uuid'})
	},{additionalProperties:false}),
	query:T.Object({}),
	body:T.Object({
		uri:T.String({format:'uri',maxLength:2048})
	},{additionalProperties:false})
},{title:'PUT /api/server/put/:uuid request'});

export type PetQuerySchemaApiServerPutRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/server/put/:uuid
export class PetQuerySchemaApiServerPutRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaApiServerPutRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiServerPutRequest{
		return new PetQuerySchemaApiServerPutRequest(
			PetQuerySchema.parse(PetQuerySchemaApiServerPutRequest._validator,json)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiServerPutRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiServerPutRequest
		)=>Promise<
			PetQuerySchemaApiServerPutResponse|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaApiServerPutRequest.fromJson,
			handler,
			req,
			res
		);
	}

	getUuid():uuid_t{
		return this._values.params.uuid;
	}

	getUri():uri_t{
		return this._values.body.uri;
	}
};
