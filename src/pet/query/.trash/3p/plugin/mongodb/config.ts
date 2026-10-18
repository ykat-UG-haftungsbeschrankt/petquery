/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPluginConfig} from '#petquery/plugin.js';

export class PetQuery3pPluginMongodbConfig
	extends PetQueryPluginConfig{
	protected _uri:uri_t;
	protected _db:string;
	protected _collection:string;
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{uri:uri_t;db:string;collection:string;}
	){
		super(baseCfg);
		this._uri = cfg.uri;
		this._db = cfg.db;
		this._collection = cfg.collection;
	}
	getUri():uri_t{
		return this._uri;
	}
	getDb():string{
		return this._db;
	}
	getCollection():string{
		return this._collection;
	}
};
