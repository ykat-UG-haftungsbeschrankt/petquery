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
	success:T.Literal(true),
	error:T.Array(T.String())
},{
	title:'DELETE /api/server/delete/:uuid response',
	additionalProperties:false
});

export type PetQuerySchemaApiServerDeleteResponseValues =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of DELETE /api/server/delete/:uuid. Errors are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaApiServerDeleteResponse
	extends PetQueryServerResponseSchema<
		PetQuerySchemaApiServerDeleteResponseValues
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaApiServerDeleteResponse{
		return new PetQuerySchemaApiServerDeleteResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaApiServerDeleteResponse._validator,json)
		);
	}
};
