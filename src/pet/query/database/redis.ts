/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { createClient } from 'redis';
import { PetQueryDatabaseRecord } from '#petquery/database/record.js';
import { PetQueryLog } from '#petquery/log.js';

import type { PetQueryDatabaseRecordType } from '#petquery/database/record.js';
import type { PetQuerySchemaDatabaseConfigRedisType } from '#schema/database/config/redis.js';

export class PetQueryDatabaseRedis extends PetQueryDatabaseRecord{
	protected readonly _client:ReturnType<typeof createClient>;
	protected _readyPromise:Promise<void>|null;

	constructor(
		config:PetQuerySchemaDatabaseConfigRedisType,
		aiSearchPath?:filename_t
	){
		super(aiSearchPath);
		this._client = createClient({url:config.connectionString});
		this._readyPromise = null;
		this._client.on('error',this._onClientError.bind(this));
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
				if(this._client.isOpen){
					await this._client.close();
				}
			}
		}
		catch(UNUSED_e){
		}
	}

	protected async _connect():Promise<void>{
		await this._client.connect();
	}

	protected async _getClient():Promise<ReturnType<typeof createClient>>{
		this._assertNotDestroyed();
		if(null === this._readyPromise){
			this._readyPromise = this._connect();
		}
		await this._readyPromise;
		this._assertNotDestroyed();
		return this._client;
	}

	protected override async _recordGet(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<unknown|undefined>{
		const client = await this._getClient();
		const value = await client.get(this._buildKey(recordType,gid));
		if(null === value){
			return undefined;
		}
		return value;
	}

	protected override async _recordPut(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		value:utf8_t
	):Promise<void>{
		const client = await this._getClient();
		await client.set(this._buildKey(recordType,gid),value);
	}

	protected override async _recordRemove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>{
		const client = await this._getClient();
		await client.del(this._buildKey(recordType,gid));
	}

	protected override async _recordGetValues(
		recordType:PetQueryDatabaseRecordType
	):Promise<Array<unknown>>{
		const client = await this._getClient();
		const values:Array<unknown> = [];
		const pattern = this._buildKey(recordType,'*');
		for await(const keys of client.scanIterator({
			MATCH:pattern,
			COUNT:100
		})){
			for(const key of keys){
				const value = await client.get(key);
				if(null !== value){
					values.push(value);
				}
			}
		}
		return values;
	}

	protected override async _recordReplaceAuth(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>{
		const client = await this._getClient();
		const result = await client.eval(
			`local oldValue = redis.call('GET', KEYS[1])
			if not oldValue then return 0 end
			if KEYS[1] == KEYS[2] then
				redis.call('SET', KEYS[1], ARGV[1])
				return 1
			end
			if redis.call('EXISTS', KEYS[2]) ~= 0 then
				return -1
			end
			redis.call('DEL', KEYS[1])
			redis.call('SET', KEYS[2], ARGV[1])
			return 1`,
			{
				keys:[
					this._buildKey('auth',oldKey),
					this._buildKey('auth',newKey)
				],
				arguments:[value]
			}
		);
		if('number' !== typeof result){
			throw new Error('Invalid Redis auth replacement result');
		}
		if(0 === result){
			throw new Error('API client token was not found');
		}
		if(-1 === result){
			throw new Error('API client token already exists');
		}
		if(1 !== result){
			throw new Error('Invalid Redis auth replacement result');
		}
	}

	protected _buildKey(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):utf8_t{
		return `petquery:${recordType}:${gid}`;
	}

	protected _onClientError(error:Error):void{
		PetQueryLog.getInstance().error('Redis client error',error);
	}
};
