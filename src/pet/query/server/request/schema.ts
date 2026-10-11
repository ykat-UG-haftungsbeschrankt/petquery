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

// The parts of an HTTP request that a request schema validates.
export type PetQueryServerRequestSchemaInput = {
	params:unknown;
	query:unknown;
	body:unknown;
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

	// Validates req with parse, passes the typed request to handler and
	// sends the response it returns. Invalid requests get a 400, handler
	// errors a 500. Never rejects. Subclasses wrap it in a static _handle()
	// with concrete types, so that .bind() keeps them.
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
					body:req.body
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
};
