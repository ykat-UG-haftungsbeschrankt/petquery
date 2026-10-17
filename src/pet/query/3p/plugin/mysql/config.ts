/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPluginConfig} from '#petquery/plugin.js';
import type {DbConfig} from 'mysql2-async';

export class PetQuery3pPluginMysqlConfig
	extends PetQueryPluginConfig{
	protected _dbCfg:DbConfig | string;
	protected _query:string;
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{dbCfg:DbConfig | string;query:string;}
	){
		super(baseCfg);
		this._dbCfg = cfg.dbCfg;
		this._query = cfg.query;
	}
	getDbCfg():DbConfig | string{
		return this._dbCfg;
	}
	getQuery():string{
		return this._query;
	}
};
