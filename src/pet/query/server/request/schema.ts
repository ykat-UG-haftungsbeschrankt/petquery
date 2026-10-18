/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';
import type {
	PetQueryServerResponseSchema
} from '#petquery/server/response/schema.js';
import { PetQuerySchema,PetQuerySchemaCheck,PetQuerySchemaType } from '#petquery/schema.js';
import { PetQueryHttp, PetQueryHttpMethod, PetQueryHttpStatusCode } from '#petquery/http.js';
import { PetQuerySingleton } from '#petquery/singleton.js';

export abstract class PetQueryServerRequestSchema<
	 T_REQUEST
	,T_RESPONSE
> extends PetQuerySingleton{
	readonly schema:PetQuerySchemaType;

	protected constructor(){
		super();
		this.schema = this.getSchema();
	}

	abstract getSchema():PetQuerySchemaType;
	abstract getValidator():PetQuerySchemaCheck<T_REQUEST>;
	abstract getResponseSchema():PetQueryServerResponseSchema<T_RESPONSE>;

	fromJson(
		json:json_t
	):T_REQUEST{
		return PetQuerySchema.parse<
			T_REQUEST
		>(this.getValidator(),json);
	}

	protected _parseRequest(json:json_t):T_REQUEST{
		if(null !== json
		&& 'object' === typeof json
		&& false === Array.isArray(json)
		&& 0 === Object.keys(json).length
		&& this.getValidator().Check(null)){
			return this.fromJson(null);
		}
		return this.fromJson(json);
	}

	toJson(
		params:T_REQUEST
	){
		return params as json_t;
	}

	async fetch(
		uri:uri_t,
		params:T_REQUEST,
		signal:AbortSignal
	):Promise<T_RESPONSE>{
		const result = await PetQueryHttp.fetchJson(
			PetQueryHttpMethod.GET,
			PetQueryHttpStatusCode.OK,
			{
				uri:uri,
				data:this.toJson(params),
				signal:signal
			}
		);
		return PetQuerySchema.parse<
			T_RESPONSE
		>(this.getResponseSchema().getValidator(),result);
	}

	_handle(
		handler:(
			request:T_REQUEST,
			req:PetQueryServerRequest,
			res:PetQueryServerResponse
		)=>Promise<T_RESPONSE|void>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		return this._handleRequest(
			this._parseRequest.bind(this),
			handler,
			req,
			res
		);
	}

	protected async _handleRequest(
		parse:(json:json_t)=>T_REQUEST,
		handler:(
			request:T_REQUEST,
			req:PetQueryServerRequest,
			res:PetQueryServerResponse
		)=>Promise<T_RESPONSE|void>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			try{
				const data = await handler(
					parse(req.getHandlerArgs()),
					req,
					res
				);
				if(!res.getHeadersSent()){
					if(undefined === data){
						throw new Error('Handler did not produce a response');
					}
					res.sendApiSuccess(data);
				}
			}catch(error){
				if(res.getHeadersSent()){
					throw error;
				}
				this._sendRequestError(res,error);
			}
		}catch(error){
			console.error(`Sending the response failed: ${util.inspect(error)}`);
		}
	}

	protected _sendRequestError(
		res:PetQueryServerResponse,
		error:unknown
	):void{
		res.sendApiError(error);
	}
};