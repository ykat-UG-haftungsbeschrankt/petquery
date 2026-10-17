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
import type {PetQueryResult} from '#petquery/result.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	// false if a plugin failed; data then holds the other results.
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Array(T.Object({
		source:T.Object({
			favicon:T.String(),
			url:T.String(),
			name:T.String()
		},{additionalProperties:false}),
		preview:T.String(),
		files:T.Array(T.String()),
		attributes:T.Record(T.String(),T.Unknown())
	},{additionalProperties:false}))
},{
	title:'Search response of /api and /json',
	additionalProperties:false
});

export type PetQuerySchemaSearchResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Results of a search. Invalid requests and failed handlers are sent as
// PetQueryServerResponseSchemaError.
export class PetQuerySchemaSearchResponse
	extends PetQueryServerResponseSchema<
		PetQuerySchemaSearchResponseType
	>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	// For clients: validates a received response. Throws an Error naming
	// each invalid field.
	static fromJson(
		status:uint16_t,
		json:unknown
	):PetQuerySchemaSearchResponse{
		return new PetQuerySchemaSearchResponse(
			status,
			PetQuerySchema.parse(PetQuerySchemaSearchResponse._validator,json)
		);
	}

	static fromResult(
		status:uint16_t,
		result:PetQueryResult
	):PetQuerySchemaSearchResponse{
		const data:PetQuerySchemaSearchResponseType['data'] = [];

		for(const entry of result.getData().getData()){
			const source = entry.getSource();
			data.push({
				source:{
					favicon:source.getFavicon(),
					url:source.getUrl(),
					name:source.getName()
				},
				preview:entry.getPreview(),
				files:entry.getFiles(),
				attributes:entry.getAttributes()
			});
		}

		return new PetQuerySchemaSearchResponse(status,{
			success:result.isSuccess(),
			error:result.getError(),
			data
		});
	}
};
