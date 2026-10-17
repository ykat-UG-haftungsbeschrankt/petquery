/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginQueryFile} from
	'#petquery/plugin/query/file.js';
import type {
	PetQueryServerAuth,
	PetQueryServerAuthUser
} from '#petquery/server/auth.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';
import type {UploadedFile} from 'express-fileupload';
import type {default as Express} from 'express';

export class PetQueryServerRequest{
	protected readonly _request:Express.Request;

	readonly params:Express.Request['params'];
	readonly query:Express.Request['query'];
	readonly body:Express.Request['body'];
	readonly files:Express.Request['files'];
	readonly headers:Express.Request['headers'];
	readonly path:utf8_t;
	readonly originalUrl:utf8_t;
	petQueryPluginQuery?:PetQueryPluginQuery;
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
	}

	async _authenticateUser(
		auth:PetQueryServerAuth,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await auth.authenticate(this);
		if(null === user){
			res._sendAuthError(401,'Authentication required');
			return;
		}
		this.petQueryUser = user;
		next();
	}

	async _authenticateAdmin(
		auth:PetQueryServerAuth,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await auth.authenticate(this);
		if(null === user){
			res._sendAuthError(401,'Authentication required');
			return;
		}
		if('admin' !== user.group){
			res._sendAuthError(403,'Admin access required');
			return;
		}
		this.petQueryUser = user;
		next();
	}

	getHandlerArgs():json_t{
		const files:json_object_t = {};
		for(const [key, file] of this._getFiles()){
			files[key] = file.toJson();
		}
		return {
			...files,
			...this.body,
			...this.query,
			...this.params
		};
	}

	_getFiles():Map<string, PetQueryPluginQueryFile>{
		const files = new Map<string, PetQueryPluginQueryFile>();
		for(const key of Object.keys(this._request.files ?? {})){
			const file = this._request.files?.[key];
			if(undefined === file){
				throw new Error(`Uploaded file "${key}" is undefined`);
			}
			const fileArray:Array<UploadedFile> =
				Array.isArray(file) ? file : [file];
			for(const value of fileArray){
				files.set(key, new PetQueryPluginQueryFile({
					filename:value.name,
					mime:value.mimetype,
					data:value.data.toString('base64'),
					size:value.size,
					md5:value.md5
				}));
			}
		}
		return files;
	}
};
