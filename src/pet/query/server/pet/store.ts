/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {PetQueryServerDatabase} from '#petquery/server/database.js';
import {PetQueryResultDataEntry} from '#petquery/result/data/entry.js';
import {PetQueryResultDataSource} from '#petquery/result/data/source.js';

export type PetQueryServerPetRecord = {
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

export class PetQueryServerPetStore{
	protected readonly _db:PetQueryServerDatabase;
	protected readonly _source:PetQueryResultDataSource;

	constructor(db:PetQueryServerDatabase){
		this._db = db;
		this._source = new PetQueryResultDataSource({
			favicon:'',
			url:'',
			name:'PetQuery local pets'
		});
	}

	destructor():void{
		try{
			this._source.destructor();
		}
		catch(UNUSED_e){
		}
	}

	parse(value:unknown):PetQueryServerPetRecord{
		return PetQuerySchema.parse(petValidator,value);
	}

	async list():Promise<Array<PetQueryServerPetRecord>>{
		const entries = await this._db.getEntries();
		const ret:Array<PetQueryServerPetRecord> = [];
		for(const [key,value] of entries){
			if(!key.startsWith('pet:')){
				continue;
			}
			ret.push(this._parseStored(value));
		}
		ret.sort((a,b)=>a.pet_id.localeCompare(b.pet_id));
		return ret;
	}

	async get(petId:utf8_t):Promise<PetQueryServerPetRecord|null>{
		const text = await this._db.get(this._getKey(petId));
		return undefined === text ? null : this._parseStored(text);
	}

	async create(
		pet:PetQueryServerPetRecord
	):Promise<PetQueryServerPetRecord>{
		this._validatePetId(pet.pet_id);
		if(null !== await this.get(pet.pet_id)){
			throw new Error(`Pet "${pet.pet_id}" already exists`);
		}
		await this._db.put(this._getKey(pet.pet_id),JSON.stringify(pet));
		return pet;
	}

	async update(
		petId:utf8_t,
		pet:PetQueryServerPetRecord
	):Promise<PetQueryServerPetRecord>{
		this._validatePetId(petId);
		if(petId !== pet.pet_id){
			throw new Error('Path pet_id must match body pet_id');
		}
		if(null === await this.get(petId)){
			throw new Error(`Pet "${petId}" does not exist`);
		}
		await this._db.put(this._getKey(petId),JSON.stringify(pet));
		return pet;
	}

	async remove(petId:utf8_t):Promise<void>{
		this._validatePetId(petId);
		await this._db.remove(this._getKey(petId));
	}

	async search(query:utf8_t):Promise<Array<PetQueryResultDataEntry>>{
		const needle = query.trim().toLowerCase();
		const pets = await this.list();
		const ret:Array<PetQueryResultDataEntry> = [];
		for(const pet of pets){
			if('' !== needle && !this._matches(pet,needle)){
				continue;
			}
			ret.push(this._toSearchEntry(pet));
		}
		return ret;
	}

	protected _parseStored(text:utf8_t):PetQueryServerPetRecord{
		return this.parse(JSON.parse(text));
	}

	protected _toSearchEntry(
		pet:PetQueryServerPetRecord
	):PetQueryResultDataEntry{
		return new PetQueryResultDataEntry({
			source:this._source,
			preview:'',
			files:pet.files,
			attributes:{
				pet_id:pet.pet_id,
				name:pet.name,
				species:pet.species,
				owner_contact:pet.owner_contact,
				notes:pet.notes
			}
		});
	}

	protected _matches(pet:PetQueryServerPetRecord,needle:utf8_t):bool_t{
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
	}

	protected _getKey(petId:utf8_t):utf8_t{
		return `pet:${petId}`;
	}
};
