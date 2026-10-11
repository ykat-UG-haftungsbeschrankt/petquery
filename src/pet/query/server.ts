/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {default as Express} from 'express';
import fileUpload from 'express-fileupload';
import https from 'node:https';
import util from 'node:util';
import {v1 as uuidv1} from 'uuid';
import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';
import {PetQueryPluginResultEntry} from '#petquery/plugin/result/entry.js';
import {PetQueryResult} from '#petquery/result.js';
import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryServerRoute} from '#petquery/server/route.js';

export type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export class PetQueryServer{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _app:Express.Express;
	protected readonly _plugins:Map<string,PetQueryPlugin>;
	protected readonly _uuid:uuid_t;

	constructor(config:PetQueryConfigServerType){
		this._config = config;
		this._app = Express();
		this._app.use(Express.json());
		this._app.use(Express.urlencoded());
		if(this._config.file.upload){
			this._app.use(fileUpload(
				this._config.file.upload.options
			));
		}
		this._plugins = new Map();
		this._uuid = uuidv1();
	}

	addPlugin(plugin:PetQueryPlugin):void{
		if(!plugin.isEnabled()){
			return;
		}
		if(this._plugins.has(plugin.getName())){
			throw new Error(
				`Plugin "${plugin.getName()}" is already registered`
			);
		}
		this._plugins.set(plugin.getName(),plugin);
	}

	start():void{
		if(this._config.http.enabled){
			this._app.listen(
				this._config.http.port,
				this._onHttpListening.bind(this)
			);
		}

		if(this._config.https.enabled){
			https.createServer(this._config.https.certificate)
				.listen(
					this._config.https.port,
					this._onHttpsListening.bind(this)
				);
		}
	}

	_getConfig():PetQueryConfigServerType{
		return this._config;
	}

	_getUuid():uuid_t{
		return this._uuid;
	}

	_getPlugin(name:string):PetQueryPlugin|undefined{
		return this._plugins.get(name);
	}

	async _queryAll(
		query:PetQueryPluginQuery
	):Promise<PetQueryResult>{
		const result = {
			success:true,
			error:new Array<json_string_t>(),
			data:new Array<PetQueryPluginResultEntry>()
		};
		const promises = [];
		for(const plugin of this._plugins.values()){
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
				this._config.max_results_per_module
			);
			result.data.push(
				...data
			);
		}

		result.data = result.data.slice(
			0,
			this._config.max_results_total
		);

		return new PetQueryResult(
			result.success,
			result.error,
			new PetQueryPluginResult(result.data)
		);
	}

	registerRoutes(routes:PetQueryServerRoute[]):void{
		for(const route of routes){
			route.register(this._app);
		}
	}

	protected _onHttpListening():void{
		console.log(
			`Express App running at http://127.0.0.1:`
			+`${this._config.http.port}/`
		);
	}

	protected _onHttpsListening():void{
		console.log(
			`Express App running at https://127.0.0.1:`
			+`${this._config.https.port}/`
		);
	}
};
