/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {NextFunction} from 'express';
import type {PetQueryServer} from '#petquery/server.js';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';

export type PetQueryServerNext = NextFunction;
export type PetQueryServerHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:PetQueryServerNext
)=>void|Promise<void>;
export type PetQueryServerRouteHandler = (
	args:json_t
)=>Promise<json_t>;

class PetQueryServerRouteContext{
	private readonly _route:PetQueryServerRoute;
	private readonly _req:PetQueryServerRequest;
	private readonly _res:PetQueryServerResponse;
	private readonly _next:PetQueryServerNext;
	private readonly _errors:Array<utf8_t> = [];

	constructor(
		 route:PetQueryServerRoute
		,req:PetQueryServerRequest
		,res:PetQueryServerResponse
		,next:PetQueryServerNext
	){
		this._route = route;
		this._req = req;
		this._res = res;
		this._next = next;
		this._errors = [];
	}
	getRoute():PetQueryServerRoute{
		return this._route;
	}
	getRequest():PetQueryServerRequest{
		return this._req;
	}
	getResponse():PetQueryServerResponse{
		return this._res;
	}
	next():void{
		this._next();
	}
	getServer():PetQueryServer{
		return this._route.getServer();
	}
	getErrors():Array<utf8_t>{
		return this._errors;
	}
	addError(error:utf8_t):void{
		this._errors.push(error);
	}
}

export enum PetQueryServerRouteAccessGroup{
	User = 'user',
	Admin = 'admin'
};

export abstract class PetQueryServerRoute{
	private readonly _server:PetQueryServer;

	constructor(server:PetQueryServer){
		this._server = server;
	}

	abstract register():void;

	getServer():PetQueryServer{
		return this._server;
	}

	protected _authenticateUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):Promise<void>{
		return req._authenticateUser(this.getServer()._getAuth(),res,next);
	}

	protected _authenticateAdmin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):Promise<void>{
		return req._authenticateAdmin(this.getServer()._getAuth(),res,next);
	}

	protected _getAccessGroupHandler(group:PetQueryServerRouteAccessGroup){
		switch(group){
			case PetQueryServerRouteAccessGroup.User:
				return this._authenticateUser.bind(this);
			case PetQueryServerRouteAccessGroup.Admin:
				return this._authenticateAdmin.bind(this);
			default:
				throw new Error(`Unknown authentication group: ${group}`);
		}
	}

	protected _wrap(
		handler:PetQueryServerRouteHandler
	):PetQueryServerHandler{
		return async (req,res,next)=>{
			const context = new PetQueryServerRouteContext(
				this,
				req,
				res,
				next
			);
			try{
				const callback = handler.bind(context);
				this._sendRouteResponse(
					res,
					200,
					false,
					context.getErrors(),
					await callback(req.getHandlerArgs())
				);
			}
			catch(error){
				this._sendRouteResponse(
					res,
					400,
					false,
					[
						 this._getErrorMessage(error)
						,...context.getErrors()
					],
					null
				);
			}
		};
	}

	protected _sendRouteResponse(
		res:PetQueryServerResponse,
		status:uint16_t,
		success:boolean,
		error:Array<utf8_t>,
		data:json_t
	):void{
		res.set('Cache-Control','no-store');
		res.status(status).json({
			 success:success
			,error:error
			,data:data
		});
	}

	protected _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : String(error);
	}
};
