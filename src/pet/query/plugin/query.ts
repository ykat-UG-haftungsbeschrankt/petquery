/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryPluginQueryFile} from '#petquery/plugin/query/file.js';

export class PetQueryPluginQuery{
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
	toJson(){
		return {
			query: this._query,
			bearer: this._bearer,
			files: this._files.map(file => ({
				filename: file.getFilename(),
				mime: file.getMime(),
				size: file.getSize(),
				data: file.getData(),
				md5: file.getMd5()
			})),
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
};
