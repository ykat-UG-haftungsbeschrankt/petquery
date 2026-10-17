/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import type {PetQuerySchemaSearchResponseType} from
	'#schema/search/response.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';
import {PetQuerySchemaSearchResponse} from
	'#schema/search/response.js';

const T = PetQuerySchema.type;
const uuid = T.String({format:'uuid'});
const MAX_HOPS = 1000;

const schema = T.Object({
	query:T.Optional(T.String()),
	bearer:T.Optional(T.String()),
	iframe:T.Optional(T.Union([
		T.Boolean(),
		T.Literal('true'),
		T.Literal('false')
	])),
	tracerouteUuid:T.Optional(T.Union([
		uuid,
		T.Array(uuid,{maxItems:MAX_HOPS})
	]))
},{title:'Search request of /api and /json'});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaSearchRequestType =
	PetQuerySchemaStatic<typeof schema>;

// Search of /api and /json. Body parameters take precedence over query
// parameters. Uploaded files are not part of the schema.
class PetQuerySchemaSearchRequest extends
	PetQueryServerRequestSchema<
		 PetQuerySchemaSearchRequestType
		,PetQuerySchemaSearchResponseType
	>{
	protected static _instance:
		PetQuerySchemaSearchRequest | null = null;
	public static getInstance():PetQuerySchemaSearchRequest{
		if(this._instance === null){
			this._instance = new PetQuerySchemaSearchRequest();
		}
		return this._instance;
	}
	getSchema(){
		return schema;
	}
	getValidator(){
		return validator;
	}
	getResponseSchema(){
		return PetQuerySchemaSearchResponse;
	};
};

const petQuerySchemaSearchRequest =
	PetQuerySchemaSearchRequest.getInstance();

export {
	petQuerySchemaSearchRequest as PetQuerySchemaSearchRequest
};
