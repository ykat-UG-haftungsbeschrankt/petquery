/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetQuerySchemaPluginConfigType } from '#schema/plugin/config.js';
import type { PetQuerySchemaPluginDataSourceType } from '#schema/plugin/data/source.js';
import type { PetQuerySchemaPluginRequestType } from '#schema/plugin/request.js';
import type { PetQuerySchemaPluginResponseType } from '#schema/plugin/response.js';

export class PetQueryPluginConfig{
	private _enabled:boolean;
	private _timeout:milliseconds_t;
	private _source:PetQuerySchemaPluginDataSourceType;
	constructor(obj:PetQuerySchemaPluginConfigType){
		this._enabled = obj.enabled;
		this._timeout = obj.timeout;
		this._source = obj.source;
	}
	isEnabled():boolean{
		return this._enabled !== false;
	}
	getTimeout():milliseconds_t{
		return this._timeout;
	}
	getSource():PetQuerySchemaPluginDataSourceType{
		return this._source;
	}
};

export abstract class PetQueryPlugin{
	protected readonly _name:string;
	protected readonly _baseCfg:PetQuerySchemaPluginConfigType;
	protected _destructorPromise:Promise<void>|null;

	constructor(name:string, cfg:PetQuerySchemaPluginConfigType){
		this._name = name;
		this._baseCfg = cfg;
		this._destructorPromise = null;
	}
	getName():string{
		return this._name;
	}
	getTimeout():milliseconds_t{
		return this._baseCfg.timeout;
	}
	isEnabled():boolean{
		return this._baseCfg.enabled;
	}
	getSource():PetQuerySchemaPluginDataSourceType{
		return this._baseCfg.source;
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
		query:PetQuerySchemaPluginRequestType
	):Promise<PetQuerySchemaPluginResponseType>;
};
