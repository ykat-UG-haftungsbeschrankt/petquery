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
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryResult} from '#petquery/result.js';
import {PetQueryResultDataEntry} from '#petquery/result/data/entry.js';
import util from 'node:util';
import {PetQueryResultData} from '#petquery/result/data.js';
import {PetQuerySchemaSearchRequest} from '#schema/search/request.js';
import {PetQuerySchemaSearchResponse} from '#schema/search/response.js';

export type PetQueryServerNext = NextFunction;
export type PetQueryServerHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:PetQueryServerNext
)=>void|Promise<void>;
export type PetQueryServerRouteHandler = PetQueryServerHandler;

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

	protected _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : String(error);
	}

	// Searches the plugins in pluginFilter, all if null. A circular query
	// gets an unsuccessful result instead of being forwarded again.
	protected async _handleSearch(
		pluginFilter:Set<string>|null,
		request:PetQuerySchemaSearchRequest
	):Promise<PetQuerySchemaSearchResponse>{
		const query = request.getPluginQuery(this._server._getUuid());

		if(query.isCircularQuery()){
			return PetQuerySchemaSearchResponse.fromResult(
				200,
				new PetQueryResult(
					false,
					['Circular query detected'],
					new PetQueryResultData([])
				)
			);
		}
		const result = await this._query(query,pluginFilter);
		result.getData().append(
			new PetQueryResultData(
				await this._server._getPetStore().search(request.getQuery())
			)
		);
		return PetQuerySchemaSearchResponse.fromResult(200,result);
	}

	async _query(
		 query:PetQueryPluginQuery
		,pluginFilter:Set<string>|null
	):Promise<PetQueryResult>{
		const config = this._server.getConfig();
		const promises = [];
		for(const plugin of this._server.getPlugins(pluginFilter)){
			promises.push(plugin.query(query));
		}
		const settled = await Promise.allSettled(promises);

		let success = true;
		const error:Array<json_string_t> = [];
		const data:Array<PetQueryResultDataEntry> = [];
		for(const item of settled){
			if('rejected' === item.status){
				error.push(util.inspect(item.reason));
				continue;
			}
			success = success && item.value.isSuccess();
			error.push(...item.value.getError());
			data.push(...item.value.getData().getData().slice(
				0,
				config.max_results_per_module
			));
		}

		return new PetQueryResult(
			success,
			error,
			new PetQueryResultData(data.slice(0,config.max_results_total))
		);
	}
};
