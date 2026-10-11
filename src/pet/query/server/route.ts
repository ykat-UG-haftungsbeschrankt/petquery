/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import type {PetQueryServer} from '#petquery/server.js';
import { PetQueryPluginQuery } from '#petquery/plugin/query.js';
import { PetQueryResult } from '#petquery/result.js';
import { PetQueryResultDataEntry } from '#petquery/plugin/result/entry.js';
import util from 'node:util';
import { PetQueryResultData } from '#petquery/plugin/result.js';

export abstract class PetQueryServerRoute{
	protected readonly _server:PetQueryServer;

	constructor(server:PetQueryServer){
		this._server = server;
	}

	abstract register(app:Express.Express):void;

	protected _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : String(error);
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
