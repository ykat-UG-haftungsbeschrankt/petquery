/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryPluginConfig} from '#petquery/plugin/config.js';
import type {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import type {PetQueryResultDataSource} from
	'#petquery/result/data/source.js';
import {PetQueryResult} from '#petquery/result.js';

export abstract class PetQueryPlugin{
	protected readonly _name:string;
	protected readonly _baseCfg:PetQueryPluginConfig;
	protected _destructorPromise:Promise<void>|null;

	constructor(name:string, cfg:PetQueryPluginConfig){
		this._name = name;
		this._baseCfg = cfg;
		this._destructorPromise = null;
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
	getSource():PetQueryResultDataSource{
		return this._baseCfg.getSource();
	}
	destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
	}

	/**
	 * @param {object} query Most likely you want to pass something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} example object in function body
	 */
	abstract query(
		query:PetQueryPluginQuery
	):Promise<PetQueryResult>;
};
