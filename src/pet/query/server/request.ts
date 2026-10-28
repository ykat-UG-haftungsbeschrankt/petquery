/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetQuerySchemaPluginFileType } from '#schema/plugin/file.js';
import type { PetQueryServerAuth } from '#petquery/server/auth.js';
import type { PetQueryServerAuthUser } from '#petquery/server/auth.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';
import type { UploadedFile } from 'express-fileupload';
import type { default as Express } from 'express';

export class PetQueryServerRequest{
	protected static readonly _authenticatedUsers:
		WeakMap<Express.Request,PetQueryServerAuthUser> = new WeakMap();

	protected readonly _request:Express.Request;

	readonly params:Express.Request['params'];
	readonly query:Express.Request['query'];
	readonly body:Express.Request['body'];
	readonly files:Express.Request['files'];
	readonly headers:Express.Request['headers'];
	readonly path:utf8_t;
	readonly originalUrl:utf8_t;
	readonly ip:ip_t;
	petQueryUser?:PetQueryServerAuthUser;

	constructor(request:Express.Request){
		this._request = request;
		this.params = request.params;
		this.query = request.query;
		this.body = request.body;
		this.files = request.files;
		this.headers = request.headers;
		this.path = request.path;
		this.originalUrl = request.originalUrl;
		this.ip = request.ip ?? '0.0.0.0';
		this.petQueryUser =
			PetQueryServerRequest._authenticatedUsers.get(request);
	}

	async _authenticateUser(
		auth:PetQueryServerAuth,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await auth.authenticate(this);
		if(null === user){
			res.sendAuthUnauthorizedError('Authentication required');
			return;
		}
		this._setAuthenticatedUser(user);
		next();
	}

	async _authenticateAdmin(
		auth:PetQueryServerAuth,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await auth.authenticate(this);
		if(null === user){
			res.sendAuthUnauthorizedError('Authentication required');
			return;
		}
		if('admin' !== user.group){
			res.sendAuthForbiddenError('Admin access required');
			return;
		}
		this._setAuthenticatedUser(user);
		next();
	}

	_setAuthenticatedUser(user:PetQueryServerAuthUser):void{
		this.petQueryUser = user;
		PetQueryServerRequest._authenticatedUsers.set(
			this._request,
			user
		);
	}

	getHandlerArgs():json_t{
		const files:json_object_t = {};
		for(const [key, file] of this._getFiles()){
			files[key] = file;
		}
		return {
			...files,
			...this.body,
			...this.query,
			...this.params
		};
	}

	_getFiles():Map<string, PetQuerySchemaPluginFileType>{
		const files = new Map<string, PetQuerySchemaPluginFileType>();
		for(const key of Object.keys(this._request.files ?? {})){
			const file = this._request.files?.[key];
			if(undefined === file){
				throw new Error(`Uploaded file "${key}" is undefined`);
			}
			const fileArray:Array<UploadedFile> =
				Array.isArray(file) ? file : [file];
			for(const value of fileArray){
				files.set(key,{
					filename:value.name,
					mime:value.mimetype,
					data:value.data.toString('base64'),
					size:value.size,
					md5:value.md5
				});
			}
		}
		return files;
	}
};
