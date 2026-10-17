/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQuerySchemaPluginRequestType} from '#schema/plugin/request.js';
import {PetQuerySchemaPluginResponseType} from '#schema/plugin/response.js';
import {PetQueryResultDataEntry} from '#petquery/result/data/entry.js';
import {
	Filter,
	MongoClient,
	Document
} from 'mongodb';
import {PetQuery3pPluginMongodbConfig} from
	'#petquery/3p/plugin/mongodb/config.js';

export class PetQuery3pPluginMongodbPlugin extends PetQueryPlugin{
	private _cfg:PetQuery3pPluginMongodbConfig;
	constructor(cfg:PetQuery3pPluginMongodbConfig){
		super('mongodb',cfg);
		this._cfg = cfg;
		this._db = new MongoClient(cfg.getUri()
			//'mongodb://localhost:27017'
		);
	}
	protected _db:MongoClient;
	_normalizeQuery(obj:PetQuerySchemaPluginRequestType):Filter<Document>{
		return {
			uid:{
				$eq: obj.getQuery().trim()
			}
		};
	}
	override async query(query:PetQuerySchemaPluginRequestType):Promise<PetQuerySchemaPluginResponseType>{
		const ret = [];

		await this._db.connect();

		for(const row of
			await this._db
				.db(this._cfg.getDb())
				.collection<Document>(this._cfg.getCollection())
				.find(this._normalizeQuery(query))
				.toArray()
		){
			ret.push(PetQueryResultDataEntry.fromJson(row));
		}

		return new PetQuerySchemaPluginResponseType(
			true,
			[],
			new PetQueryResultData(ret)
		);
	}

	protected override async _destroy():Promise<void>{
		try{
			await this._db.close();
		}
		catch(UNUSED_e){
		}
		await super._destroy();
	}
};
