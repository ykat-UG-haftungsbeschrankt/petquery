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
import {PetQueryServerCallbackMergeRequestParams} from
	'#petquery/server/callback/merge/request/params.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import type {PetQueryPluginQueryFile} from
	'#petquery/plugin/query/file.js';
import type {PetQuerySchemaSearchResponse} from
	'#schema/search/response.js';

const T = PetQuerySchema.type;
const uuid = T.String({format:'uuid'});
const MAX_HOPS = 1000;

// Unknown parameters are ignored; peers send the whole
// PetQueryPluginQuery.toJson().
const schema = T.Object({
	params:T.Object({}),
	// Query strings only carry strings; a repeated key becomes an array.
	query:T.Object({
		query:T.Optional(T.String()),
		bearer:T.Optional(T.String()),
		iframe:T.Optional(T.Union([T.Literal('true'),T.Literal('false')])),
		tracerouteUuid:T.Optional(T.Union([
			uuid,
			T.Array(uuid,{maxItems:MAX_HOPS})
		]))
	}),
	body:T.Object({
		query:T.Optional(T.String()),
		bearer:T.Optional(T.String()),
		iframe:T.Optional(T.Boolean()),
		tracerouteUuid:T.Optional(T.Array(uuid,{maxItems:MAX_HOPS}))
	})
},{title:'Search request of /api and /json'});

export type PetQuerySchemaSearchRequestValues =
	PetQuerySchemaStatic<typeof schema>;

// Search of /api and /json. Body parameters take precedence over query
// parameters. Uploaded files are not part of the schema.
export class PetQuerySchemaSearchRequest
	extends PetQueryServerRequestSchema<PetQuerySchemaSearchRequestValues>{
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	protected _files:Array<PetQueryPluginQueryFile>;

	constructor(
		values:PetQuerySchemaSearchRequestValues,
		files:Array<PetQueryPluginQueryFile>
	){
		super(values);
		this._files = files;
	}

	// Throws an Error naming each invalid field.
	static fromJson(
		json:PetQueryServerRequestSchemaInput
	):PetQuerySchemaSearchRequest{
		return new PetQuerySchemaSearchRequest(
			PetQuerySchema.parse(PetQuerySchemaSearchRequest._validator,json),
			PetQueryServerCallbackMergeRequestParams._getFiles(json.files)
		);
	}

	// Express handler: validates the request, calls handler and sends its
	// response. Use as PetQuerySchemaSearchRequest._handle.bind(
	// this,this._handleX.bind(this)).
	static _handle(
		handler:(
			request:PetQuerySchemaSearchRequest
		)=>Promise<
			PetQuerySchemaSearchResponse|PetQueryServerResponseSchemaError
		>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return PetQueryServerRequestSchema._handleRequest(
			PetQuerySchemaSearchRequest.fromJson,
			handler,
			req,
			res
		);
	}

	getQuery():utf8_t{
		return this._values.body.query ?? this._values.query.query ?? '';
	}

	getBearer():utf8_t{
		return this._values.body.bearer ?? this._values.query.bearer ?? '';
	}

	getIframe():bool_t{
		return this._values.body.iframe
			?? 'true' === this._values.query.iframe;
	}

	getTracerouteUuid():Set<uuid_t>{
		const hops = this._values.body.tracerouteUuid
			?? this._values.query.tracerouteUuid
			?? [];
		return new Set(Array.isArray(hops) ? hops : [hops]);
	}

	getFiles():Array<PetQueryPluginQueryFile>{
		return this._files;
	}

	// The query to pass to the plugins of the server serverUuid.
	getPluginQuery(serverUuid:uuid_t):PetQueryPluginQuery{
		return new PetQueryPluginQuery({
			query:this.getQuery(),
			bearer:this.getBearer(),
			files:this.getFiles(),
			iframe:this.getIframe(),
			serverUuid,
			tracerouteUuid:this.getTracerouteUuid()
		});
	}
};
