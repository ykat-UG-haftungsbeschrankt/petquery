/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryPluginConfig} from '#petquery/plugin/config.js';
import type {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import type {PetQueryPluginResult} from '#petquery/plugin/result.js';
import type {PetQueryPluginResultSource} from
	'#petquery/plugin/result/source.js';

export abstract class PetQueryPlugin{
	private readonly _name:string;
	private readonly _baseCfg:PetQueryPluginConfig;

	constructor(name:string, cfg:PetQueryPluginConfig){
		this._name = name;
		this._baseCfg = cfg;
	}
	getName():string{
		return this._name;
	}
	getTimeout():milliseconds_t{
		return this._baseCfg.getTimeout();
	}
	isEnabled():boolean{
		return this._baseCfg.isEnabled();
	}
	getSource():PetQueryPluginResultSource{
		return this._baseCfg.getSource();
	}
	/**
	 * @param {object} query Most likely you want to pass something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} example object in function body
	 */
	abstract query(
		query:PetQueryPluginQuery
	):Promise<PetQueryPluginResult>;
};
