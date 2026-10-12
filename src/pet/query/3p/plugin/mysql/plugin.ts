/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryResultData} from '#petquery/result/data.js';
import {PetQueryResult} from '#petquery/result.js';
import {PetQueryResultDataEntry} from '#petquery/result/data/entry.js';
import Mysql2Async, {
	type DbConfig
} from 'mysql2-async';
import {PetQuery3pPluginMysqlFormat} from
	'#petquery/3p/plugin/mysql/format.js';
import {PetQuery3pPluginMysqlConfig} from
	'#petquery/3p/plugin/mysql/config.js';

export class PetQuery3pPluginMysqlPlugin extends PetQueryPlugin{
	constructor(cfg:PetQuery3pPluginMysqlConfig){
		super('mysql',cfg);
		this._db = null;
		this._template = new PetQuery3pPluginMysqlFormat();
		this._cfg = cfg;
	}
	protected _cfg:PetQuery3pPluginMysqlConfig;
	protected _db:Mysql2Async|null;
	protected _template:PetQuery3pPluginMysqlFormat;
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

	protected override async _destroy():Promise<void>{
		const db = this._db;
		this._db = null;
		try{
			if(null !== db){
				await db.end();
			}
		}
		catch(UNUSED_e){
		}
		await super._destroy();
	}
};
