/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { createPool } from 'mysql2/promise';
import { PetQueryDatabaseRecord } from '#petquery/database/record.js';

import type { PetQueryDatabaseRecordType } from '#petquery/database/record.js';
import type { PetQuerySchemaDatabaseConfigMariadbType } from '#schema/database/config/mariadb.js';
import type { Pool } from 'mysql2/promise';
import type { ResultSetHeader } from 'mysql2';
import type { RowDataPacket } from 'mysql2';

type MariadbRow = RowDataPacket & {
	value:unknown;
};

export class PetQueryDatabaseMariadb extends PetQueryDatabaseRecord{
	protected readonly _pool:Pool;
	protected _readyPromise:Promise<void>|null;

	constructor(
		config:PetQuerySchemaDatabaseConfigMariadbType,
		aiSearchPath?:filename_t
	){
		super(aiSearchPath);
		this._pool = createPool(config.connectionString);
		this._readyPromise = null;
	}

	protected override async _destructor():Promise<void>{
		try{
			await Promise.allSettled([
				super._destructor(),
				this._closePool()
			]);
		}
		catch(UNUSED_e){
		}
	}

	protected async _closePool():Promise<void>{
		try{
			try{
				await this._readyPromise;
			}
			finally{
				await this._pool.end();
			}
		}
		catch(UNUSED_e){
		}
	}

	protected async _getPool():Promise<Pool>{
		this._assertNotDestroyed();
		if(null === this._readyPromise){
			this._readyPromise = this._initialize();
		}
		await this._readyPromise;
		this._assertNotDestroyed();
		return this._pool;
	}

	protected async _initialize():Promise<void>{
		await this._pool.query(
			`CREATE TABLE IF NOT EXISTS petquery (
				record_type VARCHAR(16) CHARACTER SET ascii
					COLLATE ascii_bin NOT NULL,
				record_gid VARBINARY(1024) NOT NULL,
				value LONGTEXT NOT NULL,
				PRIMARY KEY (record_type,record_gid)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
		);
	}

	protected override async _recordGet(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<unknown|undefined>{
		const pool = await this._getPool();
		const [rows] = await pool.query<Array<MariadbRow>>(
			`SELECT value FROM petquery
			WHERE record_type = ? AND record_gid = ?`,
			[recordType,gid]
		);
		return rows[0]?.value;
	}

	protected override async _recordPut(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		value:utf8_t
	):Promise<void>{
		const pool = await this._getPool();
		await pool.execute(
			`INSERT INTO petquery (record_type,record_gid,value)
			VALUES (?,?,?)
			ON DUPLICATE KEY UPDATE value=VALUES(value)`,
			[recordType,gid,value]
		);
	}

	protected override async _recordRemove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>{
		const pool = await this._getPool();
		await pool.execute(
			`DELETE FROM petquery
			WHERE record_type = ? AND record_gid = ?`,
			[recordType,gid]
		);
	}

	protected override async _recordGetValues(
		recordType:PetQueryDatabaseRecordType
	):Promise<Array<unknown>>{
		const pool = await this._getPool();
		const [rows] = await pool.query<Array<MariadbRow>>(
			`SELECT value FROM petquery
			WHERE record_type = ? ORDER BY record_gid`,
			[recordType]
		);
		const values:Array<unknown> = [];
		for(const row of rows){
			values.push(row.value);
		}
		return values;
	}

	protected override async _recordReplaceAuth(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>{
		const pool = await this._getPool();
		const connection = await pool.getConnection();
		try{
			await connection.beginTransaction();
			const [removed] = await connection.execute<ResultSetHeader>(
				`DELETE FROM petquery
				WHERE record_type = ? AND record_gid = ?`,
				['auth',oldKey]
			);
			if(1 !== removed.affectedRows){
				throw new Error('API client token was not found');
			}
			await connection.execute(
				`INSERT INTO petquery (record_type,record_gid,value)
				VALUES (?,?,?)`,
				['auth',newKey,value]
			);
			await connection.commit();
		}
		catch(error){
			await connection.rollback();
			throw error;
		}
		finally{
			connection.release();
		}
	}
};
