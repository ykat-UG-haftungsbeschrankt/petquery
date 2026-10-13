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
	data:T.Array(T.Object({
		uuid:T.String({format:'uuid'}),
		uri:T.String({format:'uri'})
	},{additionalProperties:false}))
},{
	title:'GET /api/server/get response',
	additionalProperties:false
});

export type PetQuerySchemaApiServerGetResponseValues =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/server/get. Errors are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaApiServerGetResponse
	extends PetQueryServerResponseSchema<
		PetQuerySchemaApiServerGetResponseValues
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaApiServerGetResponse{
		return new PetQuerySchemaApiServerGetResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaApiServerGetResponse._validator,json)
		);
	}
};
