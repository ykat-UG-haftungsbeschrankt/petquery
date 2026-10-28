/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { NextFunction } from 'express';
import type { PetQuerySchemaApiAuthApiClientPermissionType } from '#schema/api/auth/api-client.js';
import type { PetQueryServer } from '#petquery/server.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

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

	protected _disableCache(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		res.setHeader('Cache-Control','no-store');
		next();
	}

	protected _authenticateUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):Promise<void>{
		return req._authenticateUser(this.getServer().getAuth(),res,next);
	}

	protected _authenticateAdmin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):Promise<void>{
		return req._authenticateAdmin(this.getServer().getAuth(),res,next);
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

	protected _getApiAccessHandler(
		permission:PetQuerySchemaApiAuthApiClientPermissionType,
		group?:PetQueryServerRouteAccessGroup
	):PetQueryServerHandler{
		return this._authenticateApiAccess.bind(this,permission,group);
	}

	protected async _authenticateApiAccess(
		permission:PetQuerySchemaApiAuthApiClientPermissionType,
		group:PetQueryServerRouteAccessGroup|undefined,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):Promise<void>{
		const server = this.getServer();
		const auth = server.getAuth();
		const user = await auth.authenticate(req);
		if(null !== user){
			if(PetQueryServerRouteAccessGroup.Admin === group
			&& 'admin' !== user.group){
				res.sendAuthForbiddenError('Admin access required');
				return;
			}
			req._setAuthenticatedUser(user);
			next();
			return;
		}
		if(undefined === req.headers.authorization
		&& undefined === group){
			next();
			return;
		}
		const result = await auth._authenticateApiClient(req,permission);
		if('authenticated' === result){
			next();
			return;
		}
		if('unauthorized' === result){
			res.sendAuthUnauthorizedError(
				'Valid API-client bearer token required'
			);
			return;
		}
		res.sendAuthForbiddenError(
			'API-client IP or API permission is not allowed'
		);
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
				context.getResponse().sendApiSuccess(
					await callback(req.getHandlerArgs())
				);
			}
			catch(error){
				context.getResponse().sendApiError(error);
			}
		};
	}
};
