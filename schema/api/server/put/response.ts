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

const T = PetQuerySchema.type;

const schema = T.Object({
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Array(T.Unknown())
},{
	title:'PUT /api/server/put/:uuid response',
	additionalProperties:false
});

export type PetQuerySchemaApiServerPutResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of PUT /api/server/put/:uuid. Errors are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaApiServerPutResponse
	extends PetQueryServerResponseSchema<
		PetQuerySchemaApiServerPutResponseType
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaApiServerPutResponse{
		return new PetQuerySchemaApiServerPutResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaApiServerPutResponse._validator,json)
		);
	}
};
