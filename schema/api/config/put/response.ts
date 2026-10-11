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
import {PetQueryServerConfig} from '#petquery/server/config.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	success:T.Literal(true),
	error:T.Array(T.String()),
	data:T.Object({
		// The values as saved, applied on restart.
		saved:PetQueryServerConfig.schema
	},{additionalProperties:false})
},{
	title:'PUT /api/config/put response',
	additionalProperties:false
});

export type PetQuerySchemaApiConfigPutResponseValues =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of PUT /api/config/put. Errors are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaApiConfigPutResponse
	extends PetQueryServerResponseSchema<PetQuerySchemaApiConfigPutResponseValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaApiConfigPutResponse{
		return new PetQuerySchemaApiConfigPutResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaApiConfigPutResponse._validator,json)
		);
	}
};
