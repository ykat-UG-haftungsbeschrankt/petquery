/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { MongoClient } from 'mongodb';
import { PetQueryDatabaseRecord } from '#petquery/database/record.js';

import type { PetQueryDatabaseRecordType } from '#petquery/database/record.js';
import type { PetQuerySchemaDatabaseConfigMongodbType } from '#schema/database/config/mongodb.js';
import type { Collection } from 'mongodb';
import type { Document } from 'mongodb';

type MongodbRecord = Document & {
	record_type:PetQueryDatabaseRecordType;
	record_gid:utf8_t;
	value:unknown;
};

export class PetQueryDatabaseMongodb extends PetQueryDatabaseRecord{
	protected readonly _client:MongoClient;
	protected readonly _databaseName:utf8_t;
	protected _readyPromise:Promise<Collection<MongodbRecord>>|null;

	constructor(
		config:PetQuerySchemaDatabaseConfigMongodbType,
		aiSearchPath?:filename_t
	){
		super(aiSearchPath);
		this._client = new MongoClient(config.connectionString);
		this._databaseName = config.database;
		this._readyPromise = null;
	}

	protected override async _destructor():Promise<void>{
		try{
			await Promise.allSettled([
				super._destructor(),
				this._closeClient()
			]);
		}
		catch(UNUSED_e){
		}
	}

	protected async _closeClient():Promise<void>{
		try{
			try{
				await this._readyPromise;
			}
			finally{
				await this._client.close();
			}
		}
		catch(UNUSED_e){
		}
	}

	protected async _getCollection():Promise<Collection<MongodbRecord>>{
		this._assertNotDestroyed();
		if(null === this._readyPromise){
			this._readyPromise = this._initialize();
		}
		const collection = await this._readyPromise;
		this._assertNotDestroyed();
		return collection;
	}

	protected async _initialize():Promise<Collection<MongodbRecord>>{
		await this._client.connect();
		const database = this._client.db(this._databaseName);
		const collection = database.collection<MongodbRecord>('petquery');
		await collection.createIndex(
			{record_type:1,record_gid:1},
			{unique:true}
		);
		return collection;
	}

	protected override async _recordGet(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<unknown|undefined>{
		const collection = await this._getCollection();
		const entry = await collection.findOne({
			record_type:recordType,
			record_gid:gid
		});
		return entry?.value;
	}

	protected override async _recordPut(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		value:utf8_t
	):Promise<void>{
		const collection = await this._getCollection();
		await collection.updateOne(
			{record_type:recordType,record_gid:gid},
			{$set:{value}},
			{upsert:true}
		);
	}

	protected override async _recordRemove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>{
		const collection = await this._getCollection();
		await collection.deleteOne({
			record_type:recordType,
			record_gid:gid
		});
	}

	protected override async _recordGetValues(
		recordType:PetQueryDatabaseRecordType
	):Promise<Array<unknown>>{
		const collection = await this._getCollection();
		const cursor = collection.find({record_type:recordType});
		cursor.sort({record_gid:1});
		const entries = await cursor.toArray();
		const values:Array<unknown> = [];
		for(const entry of entries){
			values.push(entry.value);
		}
		return values;
	}

	protected override async _recordReplaceAuth(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>{
		const collection = await this._getCollection();
		const result = await collection.updateOne(
			{record_type:'auth',record_gid:oldKey},
			{$set:{record_gid:newKey,value}}
		);
		if(1 !== result.matchedCount){
			throw new Error('API client token was not found');
		}
	}
};
