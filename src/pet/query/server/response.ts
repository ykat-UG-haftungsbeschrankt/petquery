/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';

export class PetQueryServerResponse{
	protected readonly _response:Express.Response;

	constructor(response:Express.Response){
		this._response = response;
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
		options:Express.SendFileOptions,
		callback:(error?:Error)=>void
	):void{
		this._response.sendFile(file,options,callback);
	}

	_sendAuthError(status:uint16_t,message:utf8_t):void{
		this.set('Cache-Control','no-store');
		this.status(status).json({
			success:false,
			error:[message],
			data:[]
		});
	}
};
