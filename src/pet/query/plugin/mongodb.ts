/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';
import {PetQueryPluginResultEntry} from '#petquery/plugin/result/entry.js';
import {
	Filter,
	MongoClient,
	Document
} from 'mongodb';
import {PetQueryPluginMongodbConfig} from '#petquery/plugin/mongodb/config.js';

export class PetQueryPluginMongodb extends PetQueryPlugin{
	private _cfg:PetQueryPluginMongodbConfig;
	constructor(cfg:PetQueryPluginMongodbConfig){
		super('mongodb',cfg);
		this._cfg = cfg;
		this._db = new MongoClient(cfg.getUri()
			//'mongodb://localhost:27017'
		);
	}
	protected _db:MongoClient;
	_normalizeQuery(obj:PetQueryPluginQuery):Filter<Document>{
		return {
			uid:{
				$eq: obj.getQuery().trim()
			}
		};
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{
		const ret = [];

		await this._db.connect();

		for(const row of
			await this._db
				.db(this._cfg.getDb())
				.collection<Document>(this._cfg.getCollection())
				.find(this._normalizeQuery(query))
				.toArray()
		){
			ret.push(PetQueryPluginResultEntry.fromJson(row));
		}

		return new PetQueryPluginResult(ret);
	}
};
