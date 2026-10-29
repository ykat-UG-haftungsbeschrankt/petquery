/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQueryJson } from '#petquery/json.js';
import { PetQueryRegexp } from '#petquery/regexp.js';
import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';
import { PetQuerySchemaServerDatabaseIndexEntry } from '#schema/server/database/index/entry.js';
import { PetQuerySchemaServerDatabasePetEntry } from '#schema/server/database/pet/entry.js';
import { PetQuerySchemaServerDatabaseSessionEntry } from '#schema/server/database/session/entry.js';
import { PetQueryServerDatabasePetSearchLoader } from '#petquery/server/database/pet/search/loader.js';

import type { PetQuerySchemaCheck } from '#petquery/schema.js';
import type { PetQuerySchemaPluginFileType } from '#schema/plugin/file.js';
import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { PetQuerySchemaServerDatabaseIndexEntryType } from '#schema/server/database/index/entry.js';
import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';
import type { PetQuerySchemaServerDatabaseSessionEntryType } from '#schema/server/database/session/entry.js';
import type { PetQueryServerDatabaseAuth } from '#petquery/server/database/auth.js';
import type { PetQueryServerDatabaseConfig } from '#petquery/server/database/config.js';
import type { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
import type { PetQueryServerDatabasePet } from '#petquery/server/database/pet.js';
import type { PetQueryServerDatabaseSession } from '#petquery/server/database/session.js';

export type PetQueryDatabaseRecordType =
	'auth'|'config'|'index'|'pet'|'server'|'session';

type PetQueryDatabaseRecordEntry = {
	gid:utf8_t;
};

const authValidator = PetQuerySchema.compile(
	PetQuerySchema.type.Object({
		gid:PetQuerySchema.type.String(),
		data:PetQuerySchema.type.String()
	},{additionalProperties:false})
);
const serverValidator = PetQuerySchema.compile(
	PetQuerySchema.type.Object({
		gid:PetQuerySchema.type.Literal('uid'),
		data:PetQuerySchema.type.String({format:'uuid'})
	},{additionalProperties:false})
);

export abstract class PetQueryDatabaseRecord extends PetQueryDestructor
implements PetQueryServerDatabaseAuth, PetQueryServerDatabaseConfig,
	PetQueryServerDatabaseIndex, PetQueryServerDatabasePet,
	PetQueryServerDatabaseSession{
	protected readonly _petSearchLoader:
		PetQueryServerDatabasePetSearchLoader;

	constructor(aiSearchPath?:filename_t){
		super();
		this._petSearchLoader = new PetQueryServerDatabasePetSearchLoader(
			aiSearchPath ?? 'var/petquery-ai-search.sqlite3'
		);
	}

	protected override async _destructor():Promise<void>{
		try{
			await this._petSearchLoader.destructor();
		}
		catch(UNUSED_e){
		}
	}

	protected abstract _recordGet(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<unknown|undefined>;

	protected abstract _recordPut(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		value:utf8_t
	):Promise<void>;

	protected abstract _recordRemove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>;

	protected abstract _recordGetValues(
		recordType:PetQueryDatabaseRecordType
	):Promise<Array<unknown>>;

	protected abstract _recordReplaceAuth(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>;

	async serverAuthGet(key:utf8_t):Promise<utf8_t|undefined>{
		const entry = await this._get('auth',key,authValidator);
		return entry?.data;
	}

	async serverAuthPut(key:utf8_t,value:utf8_t):Promise<void>{
		await this._put('auth',{gid:key,data:value});
	}

	async serverAuthReplace(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>{
		this._assertNotDestroyed();
		await this._recordReplaceAuth(
			oldKey,
			newKey,
			this._serializeValue({gid:newKey,data:value})
		);
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
	):Promise<PetQuerySchemaServerDatabaseConfigEntryType|undefined>{
		return this._get(
			'config',
			gid,
			PetQuerySchemaServerDatabaseConfigEntry.getValidator()
		);
	}

	async serverIndexGetServerUid():Promise<uuid_t|undefined>{
		const entry = await this._get('server','uid',serverValidator);
		return entry?.data;
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
			'index',
			gid,
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
		this._petSearchLoader._invalidate();
		try{
			await this._put('pet',value);
		}
		finally{
			this._petSearchLoader._invalidate();
		}
	}

	async serverPetGet(
		gid:utf8_t
	):Promise<PetQuerySchemaServerDatabasePetEntryType>{
		return this._getRequired(
			'pet',
			gid,
			PetQuerySchemaServerDatabasePetEntry.getValidator()
		);
	}

	async serverPetRemove(gid:utf8_t):Promise<void>{
		this._petSearchLoader._invalidate();
		try{
			await this._remove('pet',gid);
		}
		finally{
			this._petSearchLoader._invalidate();
		}
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
		const regex = new RegExp(PetQueryRegexp.escape(query),'im');
		const entries = await this.serverPetGetEntries();
		const results:Array<PetQuerySchemaServerDatabasePetEntryType> = [];
		for(const entry of entries){
			if(PetQueryJson.match(entry,regex)){
				results.push(entry);
			}
		}
		return results;
	}

	async serverPetSearchByFile(
		files:Array<PetQuerySchemaPluginFileType>
	):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>{
		this._assertNotDestroyed();
		const petSearch = await this._petSearchLoader._getSearch();
		return petSearch._searchByFile(
			files,
			this.serverPetGetEntries.bind(this)
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
			'session',
			gid,
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
		const now = Date.now();
		for(const entry of await this.serverSessionGetEntries()){
			if(entry.expiredTs <= now){
				await this.serverSessionRemove(entry.gid);
			}
		}
	}

	protected async _put<T extends PetQueryDatabaseRecordEntry>(
		recordType:PetQueryDatabaseRecordType,
		value:T
	):Promise<void>{
		this._assertNotDestroyed();
		await this._recordPut(
			recordType,
			value.gid,
			this._serializeValue(value)
		);
	}

	protected async _get<T>(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		validator:PetQuerySchemaCheck<T>
	):Promise<T|undefined>{
		this._assertNotDestroyed();
		const value = await this._recordGet(recordType,gid);
		if(undefined === value){
			return undefined;
		}
		return this._parseValue(value,validator);
	}

	protected async _getRequired<T>(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t,
		validator:PetQuerySchemaCheck<T>
	):Promise<T>{
		const value = await this._get(recordType,gid,validator);
		if(undefined === value){
			throw new Error(
				`Database entry not found: ${recordType} (${gid})`
			);
		}
		return value;
	}

	protected async _remove(
		recordType:PetQueryDatabaseRecordType,
		gid:utf8_t
	):Promise<void>{
		this._assertNotDestroyed();
		await this._recordRemove(recordType,gid);
	}

	protected async _getValues<T extends PetQueryDatabaseRecordEntry>(
		recordType:PetQueryDatabaseRecordType,
		validator:PetQuerySchemaCheck<T>
	):Promise<Array<T>>{
		this._assertNotDestroyed();
		const values:Array<T> = [];
		for(const value of await this._recordGetValues(recordType)){
			values.push(this._parseValue(value,validator));
		}
		values.sort(this._compareEntries.bind(this));
		return values;
	}

	protected _parseValue<T>(
		value:unknown,
		validator:PetQuerySchemaCheck<T>
	):T{
		let jsonValue:unknown = value;
		if('string' === typeof value){
			jsonValue = JSON.parse(value);
		}
		return PetQuerySchema.parse(validator,jsonValue);
	}

	protected _serializeValue<T extends PetQueryDatabaseRecordEntry>(
		value:T
	):utf8_t{
		const serialized = JSON.stringify(value);
		if(undefined === serialized){
			throw new Error('Database value is not JSON serializable');
		}
		return serialized;
	}

	protected _compareEntries(
		left:PetQueryDatabaseRecordEntry,
		right:PetQueryDatabaseRecordEntry
	):int_t{
		if(left.gid < right.gid){
			return -1;
		}
		if(left.gid > right.gid){
			return 1;
		}
		return 0;
	}
};
