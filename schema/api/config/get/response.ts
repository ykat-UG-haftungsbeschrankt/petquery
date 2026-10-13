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
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Object({
		// Values the server runs with.
		active:PetQueryServerConfig.schema,
		// Values in the config file, applied on restart; null if none.
		saved:T.Union([PetQueryServerConfig.schema,T.Null()]),
		// Why the config file could not be read, if it could not.
		saved_error:T.Union([T.String(),T.Null()]),
		// Plugin names allowed in route.api.plugins.
		plugins:T.Array(T.String())
	},{additionalProperties:false})
},{
	title:'GET /api/config/get response',
	additionalProperties:false
});

export type PetQuerySchemaApiConfigGetResponseValues =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/config/get. Errors are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaApiConfigGetResponse
	extends PetQueryServerResponseSchema<
		PetQuerySchemaApiConfigGetResponseValues
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaApiConfigGetResponse{
		return new PetQuerySchemaApiConfigGetResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaApiConfigGetResponse._validator,json)
		);
	}
};
