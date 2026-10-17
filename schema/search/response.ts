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

const schema = T.Array(
	T.Object({
		source:T.Object({
			favicon:T.String(),
			url:T.String(),
			name:T.String()
		},{additionalProperties:false}),
		preview:T.String(),
		files:T.Array(T.String()),
		attributes:T.Record(T.String(),T.Unknown())
	},{additionalProperties:false})
,{
	title:'Search response of /api and /json',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaSearchResponseType =
	PetQuerySchemaStatic<typeof schema>;

// Results of a search. Invalid requests and failed handlers are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaSearchResponse extends
	PetQueryServerResponseSchema<PetQuerySchemaSearchResponseType>{
	protected static _instance:
		PetQuerySchemaSearchResponse | null = null;
	public static getInstance():PetQuerySchemaSearchResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaSearchResponse();
		}
		return this._instance;
	}
	getSchema(){
		return schema;
	}
	getValidator(){
		return validator;
	}

	fromResult(
		result:PetQueryResult
	):PetQuerySchemaSearchResponseType{
		const data:PetQuerySchemaSearchResponseType = [];

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

		return data;
	}
};

const petQuerySchemaSearchResponse =
	PetQuerySchemaSearchResponse.getInstance();

export {
	petQuerySchemaSearchResponse as PetQuerySchemaSearchResponse
};
