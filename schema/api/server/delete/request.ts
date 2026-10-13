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
import type {PetQuerySchemaApiServerDeleteResponse} from
	'#schema/api/server/delete/response.js';

const T = PetQuerySchema.type;

// Unknown query parameters are ignored.
const schema = T.Object({
	params:T.Object({
		uuid:T.String({format:'uuid'})
	},{additionalProperties:false}),
	query:T.Object({}),
	body:T.Object({})
},{title:'DELETE /api/server/delete/:uuid request'});

export type PetQuerySchemaApiServerDeleteRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// DELETE /api/server/delete/:uuid
export class PetQuerySchemaApiServerDeleteRequest
	extends PetQueryServerRequestSchema<
		PetQuerySchemaApiServerDeleteRequestValues
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaApiServerDeleteRequest{
		return new PetQuerySchemaApiServerDeleteRequest(
			PetQuerySchema.parse(PetQuerySchemaApiServerDeleteRequest._validator,json)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaApiServerDeleteRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaApiServerDeleteRequest
		)=>Promise<
			PetQuerySchemaApiServerDeleteResponse
			|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaApiServerDeleteRequest.fromJson,
			handler,
			req,
			res
		);
	}

	getUuid():uuid_t{
		return this._values.params.uuid;
	}
};
