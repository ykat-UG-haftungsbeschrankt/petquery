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
import {PetQueryResultData} from '#petquery/plugin/result.js';
import {PetQueryResultDataEntry} from '#petquery/plugin/result/entry.js';
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
	getConfig():PetQueryConfigServerType{
		return this._config;
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
	getPlugins(pluginFilter:Set<string>|null):Iterable<PetQueryPlugin>{
		const ret = [];
		
		if(pluginFilter === null){
			return this._plugins.values();
		}
		
		for(const name of pluginFilter){
			const plugin = this._plugins.get(name);
			if(plugin !== undefined){
				ret.push(plugin);
			}
		}

		return ret;
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
