/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPluginConfig} from '#petquery/plugin/config.js';

export class PetQueryPluginPetqueryConfig
	extends PetQueryPluginConfig{
	protected _uri:uri_t;
	protected _headers:{ [key: string]: string };
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{uri:uri_t;headers:{ [key: string]: string }}
	){
		super(baseCfg);
		this._uri = cfg.uri;
		this._headers = cfg.headers;
	}
	getUri():uri_t{
		return this._uri;
	}
	getHeaders():{ [key: string]: string }{
		return this._headers;
	}
};
