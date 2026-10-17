/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import {validate as uuidValidate} from 'uuid';
import type {PetQueryServerDatabaseAuth} from
	'#petquery/server/database/auth.js';
import type {PetQueryServerDatabaseConfig} from
	'#petquery/server/database/config.js';
import type {PetQueryServerDatabaseIndex} from
	'#petquery/server/database/index.js';
import type {PetQueryServerDatabasePet} from
	'#petquery/server/database/pet.js';
import type {PetQueryServerDatabaseSession} from
	'#petquery/server/database/session.js';
import {PetQueryResultDataEntry} from
	'#petquery/result/data/entry.js';
import {PetQueryResultDataSource} from
	'#petquery/result/data/source.js';
import { PetQueryAssert } from './assert.js';

export type PetQueryPetRecord = {
	pet_id:utf8_t;
	name:utf8_t;
	species:utf8_t;
	owner_contact:utf8_t;
	notes:utf8_t;
	files:Array<uri_t>;
};

const T = PetQuerySchema.type;

const petSchema = T.Object({
	pet_id:T.String({minLength:1,maxLength:256}),
	name:T.String({minLength:1,maxLength:256}),
	species:T.String({minLength:1,maxLength:256}),
	owner_contact:T.String({maxLength:4096}),
	notes:T.String({maxLength:65536}),
	files:T.Array(T.String({maxLength:4096}),{maxItems:1000})
},{additionalProperties:false});

const petValidator = PetQuerySchema.compile(petSchema);

export abstract class PetQueryDatabase{
	protected readonly _dbAuth:PetQueryServerDatabaseAuth|null;
	protected readonly _dbConfig:PetQueryServerDatabaseConfig|null;
	protected readonly _dbIndex:PetQueryServerDatabaseIndex|null;
	protected readonly _dbPet:PetQueryServerDatabasePet|null;
	protected readonly _dbSession:PetQueryServerDatabaseSession|null;
	
	constructor(
		dbAuth:PetQueryServerDatabaseAuth|null,
		dbConfig:PetQueryServerDatabaseConfig|null,
		dbIndex:PetQueryServerDatabaseIndex|null,
		dbPet:PetQueryServerDatabasePet|null,
		dbSession:PetQueryServerDatabaseSession|null
	){
		this._dbAuth = dbAuth;
		this._dbConfig = dbConfig;
		this._dbIndex = dbIndex;
		this._dbPet = dbPet;
		this._dbSession = dbSession;
	}

	getDbAuth():PetQueryServerDatabaseAuth{
		PetQueryAssert.notNull(this._dbAuth);
		return this._dbAuth;
	}

	getDbConfig():PetQueryServerDatabaseConfig{
		PetQueryAssert.notNull(this._dbConfig);
		return this._dbConfig;
	}

	getDbIndex():PetQueryServerDatabaseIndex{
		PetQueryAssert.notNull(this._dbIndex);
		return this._dbIndex;
	}

	getDbPet():PetQueryServerDatabasePet{
		PetQueryAssert.notNull(this._dbPet);
		return this._dbPet;
	}

	getDbSession():PetQueryServerDatabaseSession{
		PetQueryAssert.notNull(this._dbSession);
		return this._dbSession;
	}
/*
	protected readonly _petSource:PetQueryResultDataSource;

	constructor(){
		this._petSource = new PetQueryResultDataSource({
			favicon:'',
			url:'',
			name:'PetQuery local pets'
		});
	}

	abstract serverSessionGet(
		key:utf8_t
	):Promise<utf8_t|undefined>;

	abstract serverSessionPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>;

	abstract serverSessionRemove(key:utf8_t):Promise<void>;

	abstract serverSessionGetEntries():Promise<Map<utf8_t,utf8_t>>;

	abstract serverAuthGet(
		key:utf8_t
	):Promise<utf8_t|undefined>;

	abstract serverAuthPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>;

	abstract serverAuthRemove(key:utf8_t):Promise<void>;

	abstract serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>;

	abstract serverIndexGet(
		key:utf8_t
	):Promise<utf8_t|undefined>;

	abstract serverIndexPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>;

	abstract serverIndexRemove(key:utf8_t):Promise<void>;

	abstract serverIndexGetEntries():Promise<Map<utf8_t,utf8_t>>;

	abstract serverPetGet(
		key:utf8_t
	):Promise<utf8_t|undefined>;

	abstract serverPetPut(
		key:utf8_t,
		value:utf8_t
	):Promise<void>;

	abstract serverPetRemove(key:utf8_t):Promise<void>;

	abstract serverPetGetEntries():Promise<Map<utf8_t,utf8_t>>;

	abstract serverConfigSave(value:json_t):Promise<void>;

	abstract serverConfigLoad():Promise<json_t|null>;

	parse(value:unknown):PetQueryPetRecord{
		return PetQuerySchema.parse(petValidator,value);
	}

	async list():Promise<Array<PetQueryPetRecord>>{
		const values = await this.serverPetGetEntries();
		const ret:Array<PetQueryPetRecord> = [];
		for(const [,value] of values){
			ret.push(this.parse(JSON.parse(value)));
		}
		ret.sort((a,b)=>a.pet_id.localeCompare(b.pet_id));
		return ret;
	}

	async get(petId:utf8_t):Promise<PetQueryPetRecord|null>{
		const value = await this.serverPetGet(this._getPetKey(petId));
		return undefined === value ? null : this.parse(JSON.parse(value));
	}

	async getByFile(file:uri_t):Promise<Array<PetQueryPetRecord>>{
		const pets = await this.list();
		return pets.filter((pet)=>{
			return pet.files.includes(file);
		});
	}

	async create(
		pet:PetQueryPetRecord
	):Promise<PetQueryPetRecord>{
		this._validatePetId(pet.pet_id);
		if(null !== await this.get(pet.pet_id)){
			throw new Error(`Pet "${pet.pet_id}" already exists`);
		}
		await this.serverPetPut(
			this._getPetKey(pet.pet_id),
			JSON.stringify(pet)
		);
		return pet;
	}

	async update(
		petId:utf8_t,
		pet:PetQueryPetRecord
	):Promise<PetQueryPetRecord>{
		this._validatePetId(petId);
		if(petId !== pet.pet_id){
			throw new Error('Path pet_id must match body pet_id');
		}
		if(null === await this.get(petId)){
			throw new Error(`Pet "${petId}" does not exist`);
		}
		await this.serverPetPut(
			this._getPetKey(petId),
			JSON.stringify(pet)
		);
		return pet;
	}

	async remove(petId:utf8_t):Promise<void>{
		this._validatePetId(petId);
		await this.serverPetRemove(this._getPetKey(petId));
	}

	async search(query:utf8_t):Promise<Array<PetQueryResultDataEntry>>{
		const needle = query.trim().toLowerCase();
		const pets = await this.list();
		const ret:Array<PetQueryResultDataEntry> = [];
		for(const pet of pets){
			if('' !== needle && !this._matches(pet,needle)){
				continue;
			}
			ret.push(new PetQueryResultDataEntry({
				source:this._petSource,
				preview:'',
				files:pet.files,
				attributes:{
					pet_id:pet.pet_id,
					name:pet.name,
					species:pet.species,
					owner_contact:pet.owner_contact,
					notes:pet.notes
				}
			}));
		}
		return ret;
	}

	async addServer(uuid:uuid_t,uri:uri_t):Promise<void>{
		this._validateUuid(uuid);
		new URL(uri);
		await this.serverIndexPut(uuid,uri);
	}

	async deleteServer(uuid:uuid_t):Promise<void>{
		this._validateUuid(uuid);
		await this.serverIndexRemove(uuid);
	}

	async getServerList():Promise<Map<uuid_t,uri_t>>{
		return this.serverIndexGetEntries();
	}

	async destructor():Promise<void>{
		try{
			this._petSource.destructor();
		}
		catch(UNUSED_e){
		}
	}

	protected _matches(pet:PetQueryPetRecord,needle:utf8_t):bool_t{
		return pet.pet_id.toLowerCase().includes(needle)
			|| pet.name.toLowerCase().includes(needle)
			|| pet.species.toLowerCase().includes(needle)
			|| pet.owner_contact.toLowerCase().includes(needle)
			|| pet.notes.toLowerCase().includes(needle);
	}

	protected _validatePetId(petId:utf8_t):void{
		if(0 === petId.trim().length || 256 < petId.length){
			throw new Error('Invalid pet_id');
		}

		protected _validateUuid(uuid:uuid_t):void{
			if(!uuidValidate(uuid)){
				throw new Error(`Invalid server UUID: ${uuid}`);
			}
		}
	}

	protected _getPetKey(petId:utf8_t):utf8_t{
		return `pet:${petId}`;
	}
*/
};
