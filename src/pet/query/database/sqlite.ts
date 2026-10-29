/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import Database from 'better-sqlite3';
import { PetQueryDatabaseRecord } from '#petquery/database/record.js';

import type { PetQueryDatabaseRecordType } from '#petquery/database/record.js';
import type { PetQuerySchemaDatabaseConfigSqliteType } from '#schema/database/config/sqlite.js';

type SqliteRow = {
	value:unknown;
};

export class PetQueryDatabaseSqlite extends PetQueryDatabaseRecord{
	protected readonly _database:Database.Database;
	protected _readyPromise:Promise<void>|null;

	constructor(
		config:PetQuerySchemaDatabaseConfigSqliteType,
		aiSearchPath?:filename_t
	){
		super(aiSearchPath);
		this._database = new Database(config.path);
		this._readyPromise = null;
	}

	protected override async _destructor():Promise<void>{
		try{
			await Promise.allSettled([
				super._destructor(),
				this._closeDatabase()
			]);
		}
		catch(UNUSED_e){
		}
	}

	protected async _closeDatabase():Promise<void>{
		try{
			await this._readyPromise;
		}
		finally{
			this._database.close();
		}
	}

	protected async _getDatabase():Promise<Database.Database>{
		this._assertNotDestroyed();
		if(null === this._readyPromise){
			this._readyPromise = this._initialize();
		}
		await this._readyPromise;
		this._assertNotDestroyed();
		return this._database;
	}

	protected async _initialize():Promise<void>{
		this._database.exec(
			`CREATE TABLE IF NOT EXISTS petquery (
				record_type TEXT NOT NULL,
				record_gid TEXT NOT NULL,
				value TEXT NOT NULL,
				PRIMARY KEY (record_type,record_gid)
			) WITHOUT ROWID`
		);
	}

	protected override async _recordGet(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<unknown|undefined>{
		const database = await this._getDatabase();
		const statement = database.prepare<
			[PetQueryDatabaseRecordType,utf8_t],
			SqliteRow
		>(
			`SELECT value FROM petquery
			WHERE record_type = ? AND record_gid = ?`
		);
		return statement.get(recordType,gid)?.value;
	}

	protected override async _recordPut(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		value:utf8_t
	):Promise<void>{
		const database = await this._getDatabase();
		const statement = database.prepare<
			[PetQueryDatabaseRecordType,utf8_t,utf8_t]
		>(
			`INSERT INTO petquery (record_type,record_gid,value)
			VALUES (?,?,?)
			ON CONFLICT (record_type,record_gid)
			DO UPDATE SET value=excluded.value`
		);
		statement.run(recordType,gid,value);
	}

	protected override async _recordRemove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>{
		const database = await this._getDatabase();
		const statement = database.prepare<
			[PetQueryDatabaseRecordType,utf8_t]
		>(
			`DELETE FROM petquery
			WHERE record_type = ? AND record_gid = ?`
		);
		statement.run(recordType,gid);
	}

	protected override async _recordGetValues(
		recordType:PetQueryDatabaseRecordType
	):Promise<Array<unknown>>{
		const database = await this._getDatabase();
		const statement = database.prepare<
			[PetQueryDatabaseRecordType],
			SqliteRow
		>(
			`SELECT value FROM petquery
			WHERE record_type = ? ORDER BY record_gid`
		);
		const values:Array<unknown> = [];
		for(const row of statement.all(recordType)){
			values.push(row.value);
		}
		return values;
	}

	protected override async _recordReplaceAuth(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>{
		const database = await this._getDatabase();
		const statement = database.prepare<
			[utf8_t,utf8_t,utf8_t]
		>(
			`UPDATE petquery
			SET record_gid = ?,value = ?
			WHERE record_type = 'auth' AND record_gid = ?`
		);
		const result = statement.run(newKey,value,oldKey);
		if(1 !== result.changes){
			throw new Error('API client token was not found');
		}
	}
};
