/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';
import type {
	PetQueryServerResponseSchema,
	PetQueryServerResponseSchemaValues
} from '#petquery/server/response/schema.js';
import {PetQueryServerResponseSchemaError} from
	'#petquery/server/response/schema/error.js';

// The parts of an HTTP request that a request schema validates. body is
// {} when the request has none. files are the uploads parsed by
// express-fileupload, if enabled.
export type PetQueryServerRequestSchemaInput = {
	params:unknown;
	query:unknown;
	body:unknown;
	files:PetQueryServerRequest['files'];
};

export type PetQueryServerRequestSchemaFetchResult = {
	status:uint16_t;
	json:unknown;
};

// Base of all validated requests. Subclasses add a static schema, a
// static fromJson(), a static _handle() and getters for the values.
export abstract class PetQueryServerRequestSchema<T>{
	protected _values:T;

	constructor(values:T){
		this._values = values;
	}

	getValues():T{
		return this._values;
	}

	destructor():void{
		try{
			// Holds no resources; present for the lifecycle convention.
		}
		catch(UNUSED_e){
		}
	}

	static async _fetchJson(
		uri:uri_t,
		path:utf8_t,
		timeout:milliseconds_t,
		signal:AbortSignal
	):Promise<PetQueryServerRequestSchemaFetchResult>{
		const response = await fetch(
			PetQueryServerRequestSchema._resolve(uri,path),
			{
				method:'GET',
				headers:{accept:'application/json'},
				redirect:'error',
				signal:AbortSignal.any([
					signal,
					AbortSignal.timeout(timeout)
				])
			}
		);
		if(!response.ok){
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}
		return {
			status:response.status,
			json:await response.json()
		};
	}

	static isHttpUri(uri:utf8_t):boolean{
		if(!URL.canParse(uri)){
			return false;
		}
		const protocol = new URL(uri).protocol;
		return 'http:' === protocol || 'https:' === protocol;
	}

	// Validates req with parse, passes the typed request to handler and
	// sends the response it returns. Invalid requests get a 400, handler
	// errors a 500. Handlers may return a PetQueryServerResponseSchemaError
	// for errors they detect themselves. Never rejects. Subclasses wrap it
	// in a static _handle() with concrete types, so that .bind() keeps them.
	static async _handleRequest<
		Request extends PetQueryServerRequestSchema<unknown>,
		Response extends PetQueryServerResponseSchema<
			PetQueryServerResponseSchemaValues
		>
	>(
		parse:(json:PetQueryServerRequestSchemaInput)=>Request,
		handler:(request:Request)=>Promise<Response>,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		let request:Request|null = null;
		let response:PetQueryServerResponseSchema<
			PetQueryServerResponseSchemaValues
		>|null = null;
		try{
			try{
				request = parse({
					params:req.params,
					query:req.query,
					body:req.body ?? {},
					files:req.files
				});
			}
			catch(error){
				response = new PetQueryServerResponseSchemaError(
					400,
					[error instanceof Error ? error.message : String(error)]
				);
			}
			if(null !== request){
				try{
					response = await handler(request);
				}
				catch(error){
					response = new PetQueryServerResponseSchemaError(
						500,
						[util.inspect(error)]
					);
				}
			}
			if(null !== response){
				// Responses reflect the current state; never reuse them.
				res.set('Cache-Control','no-store');
				res.status(response.getStatus()).json(response.toJson());
			}
		}
		catch(error){
			console.error(`Sending the response failed: ${util.inspect(error)}`);
		}
		finally{
			request?.destructor();
			response?.destructor();
		}
	}

	protected static _resolve(uri:uri_t,path:utf8_t):URL{
		if(!PetQueryServerRequestSchema.isHttpUri(uri)){
			throw new Error(`Unsupported server URI: ${uri}`);
		}
		const base = new URL(uri);
		if(!base.pathname.endsWith('/')){
			base.pathname += '/';
		}
		base.search = '';
		base.hash = '';
		return new URL(path,base);
	}
};
