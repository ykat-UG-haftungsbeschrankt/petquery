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

	async _query(
		 query:PetQueryPluginQuery
		,pluginFilter:Set<string>|null
	):Promise<PetQueryResult>{
		const result = new PetQueryResult(
			true,
			new Array<json_string_t>(),
			new PetQueryResultData(new Array<PetQueryResultDataEntry>())
		);
		const promises = [];
		for(const plugin of this._server.getPlugins(pluginFilter)){
			promises.push(plugin.query(query));
		}
		const settled = await Promise.allSettled(promises);

		for(const item of settled){
			if('rejected' === item.status){
				result.error.push(util.inspect(item.reason));
				continue;
			}
			const data = item.value.getData().slice(
				0,
				this._server.getConfig().max_results_per_module
			);
			result.data.push(
				...data
			);
		}

		result.data = result.data.slice(
			0,
			this._server.getConfig().max_results_total
		);

		return new PetQueryResult(
			result.success,
			result.error,
			new PetQueryResultData(result.data)
		);
	}
};
