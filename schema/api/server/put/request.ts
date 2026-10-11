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
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';
import type {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	params:T.Object({
		uuid:T.String({format:'uuid'})
	},{additionalProperties:false}),
	// Not used; extra query parameters are allowed.
	query:T.Object({}),
	body:T.Object({
		uri:T.String({format:'uri',maxLength:2048})
	},{additionalProperties:false})
},{
	title:'PUT /api/server/put/:uuid request',
	description:'URL path parameters, query string and JSON or form body.',
	additionalProperties:false
});

export type PetQuerySchemaApiServerPutRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// PUT /api/server/put/:uuid adds or replaces a server in the index.
export class PetQuerySchemaApiServerPutRequest
	extends PetQueryServerRequestSchema<
		PetQuerySchemaApiServerPutRequestValues
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiServerPutRequest{
		return new PetQuerySchemaApiServerPutRequest(
			PetQuerySchema.parse(
				PetQuerySchemaApiServerPutRequest._validator,
				json
			)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiServerPutRequest._handle.bind(
	// this,this._handleAddServer.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiServerPutRequest
		)=>Promise<PetQuerySchemaApiServerPutResponse>,
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
