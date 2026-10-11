/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import util from 'node:util';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQueryServerCallbackNext} from
	'#petquery/server/callback/next.js';
import {PetQueryServerCallbackMergeRequestParams} from
	'#petquery/server/callback/merge/request/params.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';
import { PetQueryResult } from '#petquery/result.js';
import { PetQueryResultData } from '#petquery/plugin/result.js';

export class PetQueryServerRouteJson extends PetQueryServerRoute{
	register(app:Express.Express):void{
		const config = this._server._getConfig().route.json;
		if(true !== config.enabled){
			return;
		}

		const mergeRequestParams =
			new PetQueryServerCallbackMergeRequestParams(this._server);
		app.all(
			'/json',
			config.authenticate ?? PetQueryServerCallbackNext.handle,
			mergeRequestParams.handle.bind(mergeRequestParams),
			this._handle.bind(this)
		);
	}

	protected async _handle(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			if(undefined === req.petQueryPluginQuery){
				throw new Error(`req.petQueryPluginQuery is undefined`);
			}

			if(req.petQueryPluginQuery.isCircularQuery()){
				throw new Error(`Circular query detected`);
			}

			const result = await this._query(
				req.petQueryPluginQuery,
				null
			);
			res.json(result.toJson());
		}catch(error){
			const result = new PetQueryResult(
				false,
				[util.inspect(error)],
				new PetQueryResultData([])
			);
			res.json(result.toJson());
		}
	}
};
