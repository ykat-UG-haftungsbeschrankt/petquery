/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryHttpStatusCode } from '#petquery/http.js';
import { PetQuerySchema } from '#petquery/schema.js';
import { inspect as NodeUtilInspect } from 'node:util';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';
import type { SendFileOptions as ExpressSendFileOptions } from 'express-serve-static-core';
import type { default as Express } from 'express';

const T = PetQuerySchema.type;

const schema = T.Object({
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Unknown()
},{
	title:'Error response of every route',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

type PetQueryServerResponseType = PetQuerySchemaStatic<typeof schema>;

export class PetQueryServerResponse{
	protected readonly _response:Express.Response;
	protected readonly _errors:string[];

	constructor(response:Express.Response){
		this._response = response;
		this._errors = [];
	}

	protected fromJson(
		json:json_t
	):PetQueryServerResponseType{
		return PetQuerySchema.parse<
			PetQueryServerResponseType
		>(validator,json);
	}

	protected toJson(
		params:PetQueryServerResponseType
	):json_t{
		return params as json_t;
	}

	static parseApiResponse(
		json:json_t
	):unknown{
		const ret = PetQuerySchema.parse<
			PetQueryServerResponseType
		>(validator,json);
		if(!ret.success){
			throw new Error(ret.error.join('\n'));
		}
		return ret.data;
	}

	protected _sendApi(
		 status:PetQueryHttpStatusCode
		,success:boolean
		,error:string[]
		,value:unknown
	):void{
		const obj:PetQueryServerResponseType = {
			success:success,
			error:error,
			data:value
		};
		this.status(status).json(this.toJson(obj));
	}
	appendError(error:unknown):void{
		this._errors.push(...(
			  error instanceof Error
			? error.message.split('\n')
			: [NodeUtilInspect(error)]
		));
	}
	sendApiSuccess(value:unknown):void{
		this._sendApi(
			 PetQueryHttpStatusCode.OK
			,true
			,this._errors
			,value
		);
	}

	sendApiError(error:unknown):void{
		this._sendApi(
			 PetQueryHttpStatusCode.INTERNAL_SERVER_ERROR
			,false
			,(error instanceof Error
				? error.message.split('\n')
				: [NodeUtilInspect(error)]
			)
			,null
		);
	}

	sendAuthUnauthorizedError(error:unknown):void{
		this._sendApi(
			 PetQueryHttpStatusCode.UNAUTHORIZED
			,false
			,(error instanceof Error
				? error.message.split('\n')
				: [NodeUtilInspect(error)]
			)
			,null
		);
	}

	sendAuthForbiddenError(error:unknown):void{
		this._sendApi(
			 PetQueryHttpStatusCode.FORBIDDEN
			,false
			,(error instanceof Error
				? error.message.split('\n')
				: [NodeUtilInspect(error)]
			)
			,null
		);
	}

	status(code:uint_t):PetQueryServerResponse{
		this._response.status(code);
		return this;
	}

	set(
		field:utf8_t,
		value:utf8_t|string[]
	):PetQueryServerResponse{
		this._response.set(field,value);
		return this;
	}

	setHeader(field:utf8_t,value:utf8_t|string[]):void{
		this._response.setHeader(field,value);
	}

	getHeadersSent():bool_t{
		return this._response.headersSent;
	}

	json(value:unknown):void{
		this._response.json(value);
	}

	end():void{
		this._response.end();
	}

	send(value:unknown):void{
		this._response.send(value);
	}

	type(value:utf8_t):PetQueryServerResponse{
		this._response.type(value);
		return this;
	}

	redirect(status:uint16_t,url:uri_t):void{
		this._response.redirect(status,url);
	}

	redirectUrl(url:uri_t):void{
		this._response.redirect(url);
	}

	cookie(
		name:utf8_t,
		value:utf8_t,
		options:Express.CookieOptions
	):void{
		this._response.cookie(name,value,options);
	}

	clearCookie(
		name:utf8_t,
		options:Express.CookieOptions
	):void{
		this._response.clearCookie(name,options);
	}

	sendFile(
		file:filename_t,
		options:ExpressSendFileOptions,
		callback:(error?:Error)=>void
	):void{
		this._response.sendFile(file,options,callback);
	}
};
