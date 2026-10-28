/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryHttp } from '#petquery/http.js';
import { PetQueryHttpMethod } from '#petquery/http.js';
import { PetQueryHttpStatusCode } from '#petquery/http.js';
import { PetQueryLog } from '#petquery/log.js';
import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerResponse } from '#petquery/server/response.js';
import { PetQuerySingleton } from '#petquery/singleton.js';

import type { PetQuerySchemaCheck } from '#petquery/schema.js';
import type { PetQuerySchemaType } from '#petquery/schema.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

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
		>(
			this.getResponseSchema().getValidator(),
			PetQueryServerResponse.parseApiResponse(result)
		);
	}

	async fetchEx(
		uri:uri_t,
		params:T_REQUEST,
		signal:AbortSignal
	):Promise<{duration: number,result: T_RESPONSE}>{
		const startTs = Date.now();
		const result = await this.fetch(uri,params,signal);
		const endTs = Date.now();
		return {
			result: result,
			duration: endTs - startTs
		};
	}

	getHandle(
		handler:(
			request:T_REQUEST,
			req:PetQueryServerRequest,
			res:PetQueryServerResponse
		)=>Promise<T_RESPONSE>
	):(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	)=>Promise<void>{
		return this._handleRequest.bind(this,handler);
	}

	protected async _handleRequest(
		handler:(
			request:T_REQUEST,
			req:PetQueryServerRequest,
			res:PetQueryServerResponse
		)=>Promise<T_RESPONSE>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			try{
				const data = await handler(
					this.fromJson(req.getHandlerArgs()),
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
			PetQueryLog.getInstance().error(
				'Sending the response failed',
				error
			);
		}
	}

	protected _sendRequestError(
		res:PetQueryServerResponse,
		error:unknown
	):void{
		res.sendApiError(error);
	}
};