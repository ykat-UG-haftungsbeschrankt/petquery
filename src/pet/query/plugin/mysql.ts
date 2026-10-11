/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryResultData} from '#petquery/plugin/result.js';
import {PetQueryResult} from '#petquery/result.js';
import {PetQueryResultDataEntry} from '#petquery/plugin/result/entry.js';
import Mysql2Async, {
	type DbConfig
} from 'mysql2-async';
import {PetQueryPluginMysqlFormat} from '#petquery/plugin/mysql/format.js';
import {PetQueryPluginMysqlConfig} from '#petquery/plugin/mysql/config.js';

export class PetQueryPluginMysql extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginMysqlConfig){
		super('mysql',cfg);
		this._db = null;
		this._template = new PetQueryPluginMysqlFormat();
		this._cfg = cfg;
	}
	protected _cfg:PetQueryPluginMysqlConfig;
	protected _db:Mysql2Async|null;
	protected _template:PetQueryPluginMysqlFormat;
	protected _normalizeDbConfig(dbCfg:DbConfig|string):DbConfig{
		if(typeof dbCfg !== 'string'){
			return dbCfg;
		}

		const uri = new URL(dbCfg);
		if(uri.protocol !== 'mysql:'){
			throw new Error('MySQL connection URI must use mysql:');
		}

		return {
			 host:uri.hostname
			,user:decodeURIComponent(uri.username)
			,password:decodeURIComponent(uri.password)
			,database:decodeURIComponent(uri.pathname.replace(/^\/+/, ''))
			,...(uri.port ? {port:Number(uri.port)} : {})
		};
	}
	protected async _getConnection():Promise<Mysql2Async>{
		if(this._db === null){
			this._db = new Mysql2Async(
				this._normalizeDbConfig(this._cfg.getDbCfg())
			);
		}

		return this._db;
	}
	protected async _normalizeQuery(obj:PetQueryPluginQuery):Promise<string>{
		return this._template.format(
			 this._cfg.getQuery()
			,obj.toJson()
		);
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryResult>{
		const ret = [];
		const db = await this._getConnection();
		const result = await db.getall<json_object_t>(
			await this._normalizeQuery(query)
		);

		for(const row of result){
			ret.push(PetQueryResultDataEntry.fromJson({
				 source:this.getSource().toJson()
				,preview:''
				,files:[]
				,attributes:row
			}));
		}

		return new PetQueryResult(
			true,
			[],
			new PetQueryResultData(ret)
		);
	}
};
