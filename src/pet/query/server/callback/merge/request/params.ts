/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import fileUpload, {UploadedFile} from 'express-fileupload';
import {validate as uuidValidate} from 'uuid';
import {PetQueryAssert} from '#petquery/assert.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginQueryFile} from '#petquery/plugin/query/file.js';
import {PetQueryTypes} from '#petquery/types.js';
import type {PetQueryServer} from '#petquery/server.js';
import type {
	PetQueryServerNext,
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export class PetQueryServerCallbackMergeRequestParams{
	protected readonly _server:PetQueryServer;

	constructor(server:PetQueryServer){
		this._server = server;
	}

	handle(
		req:PetQueryServerRequest,
		UNUSED_res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		const query = {
			...req.query,
			...req.body
		};
		const files = [];

		for(const key of Object.keys(req.files || {})){
			const file = req.files?.[key];
			let fileArray:fileUpload.UploadedFile[];
			if(PetQueryTypes.isArray(file)){
				PetQueryAssert.assertArray(file);
				fileArray = file;
			}else{
				fileArray = [file as UploadedFile];
			}
			for(const value of fileArray){
				files.push(new PetQueryPluginQueryFile({
					filename:value.name,
					mime:value.mimetype,
					data:value.data.toString('base64'),
					size:value.size,
					md5:value.md5
				}));
			}
		}
		req.petQueryPluginQuery = req.petQueryPluginQuery
			?? new PetQueryPluginQuery({
				 query:(PetQueryTypes.isString(query.query)
					? query.query
					: '')
				,bearer:(PetQueryTypes.isString(query.bearer)
					? query.bearer
					: '')
				,files:files
				,iframe:(PetQueryTypes.isBoolean(query.iframe)
					? query.iframe
					: false)
				,serverUuid:this._server._getUuid()
				,tracerouteUuid:this._parseTracerouteUuid(
					query.tracerouteUuid
				)
			});

		next();
	}

	protected _parseTracerouteUuid(
		tracerouteUuid:unknown
	):Set<uuid_t>{
		const ret = new Set<uuid_t>();
		const hops = PetQueryTypes.isArray(tracerouteUuid)
			? tracerouteUuid as unknown[]
			: [];

		for(const hop of hops){
			if(PetQueryTypes.isString(hop) && uuidValidate(hop as string)){
				ret.add(hop as uuid_t);
			}
		}

		return ret;
	}
};
