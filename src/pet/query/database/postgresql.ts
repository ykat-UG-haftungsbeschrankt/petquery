/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQuerySchema } from '#petquery/schema.js';
import {
	PetQuerySchemaServerDatabaseConfigEntry
} from '#schema/server/database/config/entry.js';
import {
	PetQuerySchemaServerDatabaseIndexEntry
} from '#schema/server/database/index/entry.js';
import {
	PetQuerySchemaServerDatabasePetEntry
} from '#schema/server/database/pet/entry.js';
import {
	PetQuerySchemaServerDatabaseSessionEntry
} from '#schema/server/database/session/entry.js';
import { Pool } from 'pg';

import type {
	PetQuerySchemaDatabaseConfigPostgresqlType
} from '#schema/database/config/postgresql.js';
import type {
	PetQuerySchemaServerDatabaseConfigEntryType
} from '#schema/server/database/config/entry.js';
import type {
	PetQuerySchemaServerDatabaseIndexEntryType
} from '#schema/server/database/index/entry.js';
import type {
	PetQuerySchemaServerDatabasePetEntryType
} from '#schema/server/database/pet/entry.js';
import type {
	PetQuerySchemaServerDatabaseSessionEntryType
} from '#schema/server/database/session/entry.js';
import type {
	PetQueryServerDatabaseAuth
} from '#petquery/server/database/auth.js';
import type {
	PetQueryServerDatabaseConfig
} from '#petquery/server/database/config.js';
import type {
	PetQueryServerDatabaseIndex
} from '#petquery/server/database/index.js';
import type {
	PetQueryServerDatabasePet
} from '#petquery/server/database/pet.js';
import type {
	PetQueryServerDatabaseSession
} from '#petquery/server/database/session.js';
import type { PetQuerySchemaCheck } from '#petquery/schema.js';

type PostgresqlEntry = {
	value:unknown;
};

type PostgresqlRecordType =
	'auth'|'config'|'index'|'pet'|'session'|'server';

const authValidator = PetQuerySchema.compile(PetQuerySchema.type.Object({
	gid:PetQuerySchema.type.String(),
	data:PetQuerySchema.type.String()
},{additionalProperties:false}));
const serverValidator = PetQuerySchema.compile(PetQuerySchema.type.Object({
	gid:PetQuerySchema.type.Literal('uid'),
	data:PetQuerySchema.type.String({format:'uuid'})
},{additionalProperties:false}));

export class PetQueryDatabasePostgresql extends PetQueryDestructor
implements PetQueryServerDatabaseAuth, PetQueryServerDatabaseConfig,
	PetQueryServerDatabaseIndex, PetQueryServerDatabasePet,
	PetQueryServerDatabaseSession{
	protected readonly _pool:Pool;
	protected _readyPromise:Promise<void>|null;

	constructor(config:PetQuerySchemaDatabaseConfigPostgresqlType){
		super();
		this._pool = new Pool({
			connectionString:config.connectionString
		});
		this._readyPromise = null;
		this._pool.on('error',this._onPoolError.bind(this));
	}

	protected override async _destructor():Promise<void>{
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

	async serverAuthGet(key:utf8_t):Promise<utf8_t|undefined>{
		const entry = await this._get('auth',key,authValidator);
		return entry?.data;
	}

	async serverAuthPut(key:utf8_t,value:utf8_t):Promise<void>{
		await this._put('auth',{gid:key,data:value});
	}

	async serverAuthRemove(key:utf8_t):Promise<void>{
		await this._remove('auth',key);
	}

	async serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>{
		const entries = new Map<utf8_t,utf8_t>();
		for(const entry of await this._getValues('auth',authValidator)){
			entries.set(entry.gid,entry.data);
		}
		return entries;
	}

	async serverConfigSave(
		gid:uuid_t,
		value:PetQuerySchemaServerDatabaseConfigEntryType
	):Promise<void>{
		if(gid !== value.gid){
			throw new Error('Configuration gid does not match');
		}
		await this._put('config',value);
	}

	async serverConfigLoad(
		gid:uuid_t
	):Promise<PetQuerySchemaServerDatabaseConfigEntryType>{
		return this._getRequired(
			'config',gid,
			PetQuerySchemaServerDatabaseConfigEntry.getValidator()
		);
	}

	async serverIndexGetServerUid():Promise<uuid_t>{
		const entry = await this._getRequired('server','uid',serverValidator);
		return entry.data;
	}

	async serverIndexSetServerUid(gid:uuid_t):Promise<void>{
		await this._put('server',{gid:'uid',data:gid});
	}

	async serverIndexAddServer(
		value:PetQuerySchemaServerDatabaseIndexEntryType
	):Promise<void>{
		await this._put('index',value);
	}

	async serverIndexGetServer(
		gid:utf8_t
	):Promise<PetQuerySchemaServerDatabaseIndexEntryType>{
		return this._getRequired(
			'index',gid,
			PetQuerySchemaServerDatabaseIndexEntry.getValidator()
		);
	}

	async serverIndexRemoveServer(gid:utf8_t):Promise<void>{
		await this._remove('index',gid);
	}

	async serverIndexGetServerList():Promise<
		Array<PetQuerySchemaServerDatabaseIndexEntryType>
	>{
		return this._getValues(
			'index',
			PetQuerySchemaServerDatabaseIndexEntry.getValidator()
		);
	}

	async serverPetAdd(
		value:PetQuerySchemaServerDatabasePetEntryType
	):Promise<void>{
		await this._put('pet',value);
	}

	async serverPetGet(
		gid:utf8_t
	):Promise<PetQuerySchemaServerDatabasePetEntryType>{
		return this._getRequired(
			'pet',gid,
			PetQuerySchemaServerDatabasePetEntry.getValidator()
		);
	}

	async serverPetRemove(gid:utf8_t):Promise<void>{
		await this._remove('pet',gid);
	}

	async serverPetGetEntries():Promise<
		Array<PetQuerySchemaServerDatabasePetEntryType>
	>{
		return this._getValues(
			'pet',
			PetQuerySchemaServerDatabasePetEntry.getValidator()
		);
	}

	async serverPetSearch(query:utf8_t):Promise<
		Array<PetQuerySchemaServerDatabasePetEntryType>
	>{
		const pool = await this._getPool();
		const result = await pool.query<PostgresqlEntry>(
			`SELECT value FROM petquery
			WHERE record_type = 'pet' AND EXISTS (
				SELECT 1
				FROM jsonb_path_query(
					value, 'strict $.**'
				) AS field(value)
				WHERE jsonb_typeof(field.value) NOT IN ('object','array')
					AND strpos(
						lower(COALESCE(field.value #>> '{}','null')),
						lower($1)
					) > 0
			)
			ORDER BY value->>'gid'`,
			[query]
		);
		return this._parseRows(
			result.rows,
			PetQuerySchemaServerDatabasePetEntry.getValidator()
		);
	}

	async serverSessionAdd(
		value:PetQuerySchemaServerDatabaseSessionEntryType
	):Promise<void>{
		await this._put('session',value);
	}

	async serverSessionGet(gid:utf8_t):Promise<
		PetQuerySchemaServerDatabaseSessionEntryType|undefined
	>{
		return this._get(
			'session',gid,
			PetQuerySchemaServerDatabaseSessionEntry.getValidator()
		);
	}

	async serverSessionGetEntries():Promise<
		Array<PetQuerySchemaServerDatabaseSessionEntryType>
	>{
		return this._getValues(
			'session',
			PetQuerySchemaServerDatabaseSessionEntry.getValidator()
		);
	}

	async serverSessionRemove(gid:utf8_t):Promise<void>{
		await this._remove('session',gid);
	}

	async serverSessionDeleteExpired():Promise<void>{
		const pool = await this._getPool();
		await pool.query(
			`DELETE FROM petquery
			WHERE record_type = 'session'
				AND (value->>'expiredTs')::numeric <= $1::numeric`,
			[Date.now()]
		);
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
		const client = await this._pool.connect();
		try{
			await client.query('BEGIN');
			await client.query(
				`CREATE TABLE IF NOT EXISTS petquery (
					record_type text NOT NULL CHECK (
						record_type IN (
							'auth','config','index','pet','session','server'
						)
					),
					value jsonb NOT NULL CHECK (
						jsonb_typeof(value) = 'object'
						AND jsonb_typeof(value->'gid')
							IS NOT DISTINCT FROM 'string'
					)
				)`
			);
			await client.query(
				`CREATE UNIQUE INDEX IF NOT EXISTS petquery_identity
				ON petquery (record_type,(value->>'gid'))`
			);
			await client.query(
				`CREATE INDEX IF NOT EXISTS petquery_session_expiry
				ON petquery (((value->>'expiredTs')::numeric))
				WHERE record_type = 'session'`
			);
			await client.query('COMMIT');
		}
		catch(error){
			await client.query('ROLLBACK');
			throw error;
		}
		finally{
			client.release();
		}
	}

	protected async _put(
		recordType:PostgresqlRecordType,
		value:json_t
	):Promise<void>{
		const pool = await this._getPool();
		await pool.query(
			`INSERT INTO petquery (record_type,value) VALUES ($1,$2::jsonb)
			ON CONFLICT (record_type,(value->>'gid'))
			DO UPDATE SET value = EXCLUDED.value`,
			[recordType,JSON.stringify(value)]
		);
	}

	protected async _get<T>(
		recordType:PostgresqlRecordType,
		identity:utf8_t,
		validator:PetQuerySchemaCheck<T>
	):Promise<T|undefined>{
		const pool = await this._getPool();
		const result = await pool.query<PostgresqlEntry>(
			`SELECT value FROM petquery
			WHERE record_type = $1 AND value->>'gid' = $2`,
			[recordType,identity]
		);
		if(0 === result.rows.length){
			return undefined;
		}
		return PetQuerySchema.parse(validator,result.rows[0].value);
	}

	protected async _getRequired<T>(
		recordType:PostgresqlRecordType,
		identity:utf8_t,
		validator:PetQuerySchemaCheck<T>
	):Promise<T>{
		const value = await this._get(recordType,identity,validator);
		if(undefined === value){
			throw new Error(
				`Database entry not found: ${recordType} (${identity})`
			);
		}
		return value;
	}

	protected async _remove(
		recordType:PostgresqlRecordType,
		identity:utf8_t
	):Promise<void>{
		const pool = await this._getPool();
		await pool.query(
			`DELETE FROM petquery
			WHERE record_type = $1 AND value->>'gid' = $2`,
			[recordType,identity]
		);
	}

	protected async _getValues<T>(
		recordType:PostgresqlRecordType,
		validator:PetQuerySchemaCheck<T>
	):Promise<Array<T>>{
		const pool = await this._getPool();
		const result = await pool.query<PostgresqlEntry>(
			`SELECT value FROM petquery WHERE record_type = $1
			ORDER BY value->>'gid'`,
			[recordType]
		);
		return this._parseRows(result.rows,validator);
	}

	protected _parseRows<T>(
		rows:Array<PostgresqlEntry>,
		validator:PetQuerySchemaCheck<T>
	):Array<T>{
		const values:Array<T> = [];
		for(const row of rows){
			values.push(PetQuerySchema.parse(validator,row.value));
		}
		return values;
	}

	protected _onPoolError(error:Error):void{
		console.error('PostgreSQL idle connection error:',error);
	}

	static buildConnectionString(config:{
		host:utf8_t,
		port:port_t,
		database:utf8_t,
		user:utf8_t,
		password:utf8_t
	}):utf8_t{
		return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
	}
};