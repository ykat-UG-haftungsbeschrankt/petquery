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

const recordFields = {
	auth:'key',
	config:'serverUid',
	index:'uid',
	pet:'petId',
	session:'sessionId',
	server:'name'
} as const;

type PostgresqlRecordType = keyof typeof recordFields;

const authValidator = PetQuerySchema.compile(PetQuerySchema.type.Object({
	key:PetQuerySchema.type.String(),
	data:PetQuerySchema.type.String()
},{additionalProperties:false}));
const serverValidator = PetQuerySchema.compile(PetQuerySchema.type.Object({
	name:PetQuerySchema.type.Literal('uid'),
	uid:PetQuerySchema.type.String({format:'uuid'})
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
		await this._put('auth',{key,data:value});
	}

	async serverAuthRemove(key:utf8_t):Promise<void>{
		await this._remove('auth',key);
	}

	async serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>{
		const entries = new Map<utf8_t,utf8_t>();
		for(const entry of await this._getValues('auth',authValidator)){
			entries.set(entry.key,entry.data);
		}
		return entries;
	}

	async serverConfigSave(
		serverUid:uuid_t,
		value:PetQuerySchemaServerDatabaseConfigEntryType
	):Promise<void>{
		if(serverUid !== value.serverUid){
			throw new Error('Configuration serverUid does not match');
		}
		await this._put('config',value);
	}

	async serverConfigLoad(
		serverUid:uuid_t
	):Promise<PetQuerySchemaServerDatabaseConfigEntryType>{
		return this._getRequired(
			'config',serverUid,
			PetQuerySchemaServerDatabaseConfigEntry.getValidator()
		);
	}

	async serverIndexGetServerUid():Promise<uuid_t>{
		const entry = await this._getRequired('server','uid',serverValidator);
		return entry.uid;
	}

	async serverIndexSetServerUid(uid:uuid_t):Promise<void>{
		await this._put('server',{name:'uid',uid});
	}

	async serverIndexAddServer(
		value:PetQuerySchemaServerDatabaseIndexEntryType
	):Promise<void>{
		await this._put('index',value);
	}

	async serverIndexGetServer(
		uid:utf8_t
	):Promise<PetQuerySchemaServerDatabaseIndexEntryType>{
		return this._getRequired(
			'index',uid,
			PetQuerySchemaServerDatabaseIndexEntry.getValidator()
		);
	}

	async serverIndexRemoveServer(uid:utf8_t):Promise<void>{
		await this._remove('index',uid);
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
		petId:utf8_t
	):Promise<PetQuerySchemaServerDatabasePetEntryType>{
		return this._getRequired(
			'pet',petId,
			PetQuerySchemaServerDatabasePetEntry.getValidator()
		);
	}

	async serverPetRemove(petId:utf8_t):Promise<void>{
		await this._remove('pet',petId);
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
			ORDER BY value->>'petId'`,
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

	async serverSessionGet(sessionId:utf8_t):Promise<
		PetQuerySchemaServerDatabaseSessionEntryType|undefined
	>{
		return this._get(
			'session',sessionId,
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

	async serverSessionRemove(sessionId:utf8_t):Promise<void>{
		await this._remove('session',sessionId);
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
						AND jsonb_typeof(value->(
							CASE record_type
								WHEN 'auth' THEN 'key'
								WHEN 'config' THEN 'serverUid'
								WHEN 'index' THEN 'uid'
								WHEN 'pet' THEN 'petId'
								WHEN 'session' THEN 'sessionId'
								WHEN 'server' THEN 'name'
							END
						)) IS NOT DISTINCT FROM 'string'
					)
				)`
			);
			for(const [recordType,field] of Object.entries(recordFields)){
				// Identifiers come only from the fixed recordFields map.
				await client.query(
					`CREATE UNIQUE INDEX IF NOT EXISTS
						petquery_${recordType}_identity
					ON petquery ((value->>'${field}'))
					WHERE record_type = '${recordType}'`
				);
			}
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
		const field = recordFields[recordType];
		await pool.query(
			`INSERT INTO petquery (record_type,value) VALUES ($1,$2::jsonb)
			ON CONFLICT ((value->>'${field}'))
				WHERE record_type = '${recordType}'
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
		const field = recordFields[recordType];
		const result = await pool.query<PostgresqlEntry>(
			`SELECT value FROM petquery
			WHERE record_type = '${recordType}' AND value->>'${field}' = $1`,
			[identity]
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
		const field = recordFields[recordType];
		await pool.query(
			`DELETE FROM petquery
			WHERE record_type = '${recordType}' AND value->>'${field}' = $1`,
			[identity]
		);
	}

	protected async _getValues<T>(
		recordType:PostgresqlRecordType,
		validator:PetQuerySchemaCheck<T>
	):Promise<Array<T>>{
		const pool = await this._getPool();
		const field = recordFields[recordType];
		const result = await pool.query<PostgresqlEntry>(
			`SELECT value FROM petquery WHERE record_type = '${recordType}'
			ORDER BY value->>'${field}'`,
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
};