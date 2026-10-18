/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiConfigGetResponse } from '#schema/api/config/get/response.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Array(
	PetQuerySchemaServerDatabasePetEntry.getSchema()
	,{
	 title:'GET /api/config/get Response'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaPluginResponseType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaPluginResponse extends
	PetQueryServerResponseSchema<
		 PetQuerySchemaPluginResponseType
	>{
	protected static _instance:
		PetQuerySchemaPluginResponse | null = null;
	public static getInstance():PetQuerySchemaPluginResponse{
		if(this._instance === null){
			this._instance = new PetQuerySchemaPluginResponse();
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
		return PetQuerySchemaApiConfigGetResponse;
	};
};

const petQuerySchemaPluginResponse =
	PetQuerySchemaPluginResponse.getInstance();

export {
	petQuerySchemaPluginResponse as PetQuerySchemaPluginResponse
};





/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.


import {PetQueryCast} from '#petquery/cast.js';
import {PetQuerySchemaPluginQueryFile} from '#petquery/plugin/query/file.js';

export class PetQuerySchemaPluginResponse{
	static readonly _uuidParser = PetQueryCast.string({
		 match:/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
		,sampleValue:'00000000-0000-0000-0000-000000000000'
	});
	static readonly _parser = PetQueryCast.object({
		 query:PetQueryCast.string()
		,bearer:PetQueryCast.string()
		,files:PetQueryCast.array(PetQuerySchemaPluginQueryFile._instanceParser)
		// Strict: PetQueryCast.boolean() treats any non-empty string as true.
		,iframe:PetQueryCast.values([true,false])
		,serverUuid:PetQuerySchemaPluginQuery._uuidParser
		,tracerouteUuid:PetQueryCast.array(PetQuerySchemaPluginQuery._uuidParser)
	});

	protected _query:string;
	protected _bearer:string;
	protected _files:Array<PetQuerySchemaPluginQueryFile>;
	protected _iframe:boolean;
	protected _serverUuid:uuid_t;
	protected _tracerouteUuid:Set<uuid_t>;

	constructor(obj:{
		query:string,
		bearer:string,
		files:Array<PetQuerySchemaPluginQueryFile>,
		iframe:boolean,
		serverUuid:uuid_t,
		tracerouteUuid:Set<uuid_t>
	}){
		this._query = obj.query;
		this._bearer = obj.bearer;
		this._files = obj.files;
		this._iframe = obj.iframe;
		this._serverUuid = obj.serverUuid;
		this._tracerouteUuid = obj.tracerouteUuid;
	}
	getServerUuid():uuid_t{
		return this._serverUuid;
	}
	getTracerouteUuid():Set<uuid_t>{
		return this._tracerouteUuid;
	}
	isCircularQuery():boolean{
		return this._tracerouteUuid.has(this._serverUuid);
	}
	getQuery():string{
		return this._query;
	}
	getBearer():string{
		return this._bearer;
	}
	getFiles():Array<PetQuerySchemaPluginQueryFile>{
		return this._files;
	}
	isIframe():boolean{
		return this._iframe;
	}
	toJson():json_object_t{
		const files:json_array_t = [];
		for(const file of this._files){
			files.push(file.toJson());
		}
		return {
			query: this._query,
			bearer: this._bearer,
			files,
			iframe: this._iframe,
			serverUuid: this._serverUuid,
			tracerouteUuid: [...this._tracerouteUuid]
		};
	}
	static fromJson(json:unknown):PetQuerySchemaPluginQuery{
		const obj = PetQuerySchemaPluginQuery._parser.parse(json);
		return new PetQuerySchemaPluginQuery({
			 query:obj.query
			,bearer:obj.bearer
			,files:obj.files
			,iframe:obj.iframe
			,serverUuid:obj.serverUuid
			,tracerouteUuid:new Set(obj.tracerouteUuid)
		});
	}
	destructor():void{
	}
};
 */




/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.


import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryPluginQueryFile} from '#petquery/plugin/query/file.js';

export class PetQuerySchemaPluginResponse{
	static readonly _uuidParser = PetQueryCast.string({
		 match:/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
		,sampleValue:'00000000-0000-0000-0000-000000000000'
	});
	static readonly _parser = PetQueryCast.object({
		 query:PetQueryCast.string()
		,bearer:PetQueryCast.string()
		,files:PetQueryCast.array(PetQueryPluginQueryFile._instanceParser)
		// Strict: PetQueryCast.boolean() treats any non-empty string as true.
		,iframe:PetQueryCast.values([true,false])
		,serverUuid:PetQueryPluginQuery._uuidParser
		,tracerouteUuid:PetQueryCast.array(PetQueryPluginQuery._uuidParser)
	});

	protected _query:string;
	protected _bearer:string;
	protected _files:Array<PetQueryPluginQueryFile>;
	protected _iframe:boolean;
	protected _serverUuid:uuid_t;
	protected _tracerouteUuid:Set<uuid_t>;

	constructor(obj:{
		query:string,
		bearer:string,
		files:Array<PetQueryPluginQueryFile>,
		iframe:boolean,
		serverUuid:uuid_t,
		tracerouteUuid:Set<uuid_t>
	}){
		this._query = obj.query;
		this._bearer = obj.bearer;
		this._files = obj.files;
		this._iframe = obj.iframe;
		this._serverUuid = obj.serverUuid;
		this._tracerouteUuid = obj.tracerouteUuid;
	}
	getServerUuid():uuid_t{
		return this._serverUuid;
	}
	getTracerouteUuid():Set<uuid_t>{
		return this._tracerouteUuid;
	}
	isCircularQuery():boolean{
		return this._tracerouteUuid.has(this._serverUuid);
	}
	getQuery():string{
		return this._query;
	}
	getBearer():string{
		return this._bearer;
	}
	getFiles():Array<PetQueryPluginQueryFile>{
		return this._files;
	}
	isIframe():boolean{
		return this._iframe;
	}
	toJson():json_object_t{
		const files:json_array_t = [];
		for(const file of this._files){
			files.push(file.toJson());
		}
		return {
			query: this._query,
			bearer: this._bearer,
			files,
			iframe: this._iframe,
			serverUuid: this._serverUuid,
			tracerouteUuid: [...this._tracerouteUuid]
		};
	}
	static fromJson(json:unknown):PetQueryPluginQuery{
		const obj = PetQueryPluginQuery._parser.parse(json);
		return new PetQueryPluginQuery({
			 query:obj.query
			,bearer:obj.bearer
			,files:obj.files
			,iframe:obj.iframe
			,serverUuid:obj.serverUuid
			,tracerouteUuid:new Set(obj.tracerouteUuid)
		});
	}
	destructor():void{
	}
};
 */