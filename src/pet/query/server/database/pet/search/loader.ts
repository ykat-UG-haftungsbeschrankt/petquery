/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQueryServerDatabasePetSearch } from '#petquery/server/database/pet/search.js';

export class PetQueryServerDatabasePetSearchLoader extends
	PetQueryDestructor{
	protected readonly _path:filename_t;
	protected _search:PetQueryServerDatabasePetSearch|undefined;
	protected _initialization:
		Promise<PetQueryServerDatabasePetSearch>|undefined;

	constructor(path:filename_t){
		super();
		this._path = path;
		this._search = undefined;
		this._initialization = undefined;
	}

	async _getSearch():Promise<PetQueryServerDatabasePetSearch>{
		this._assertNotDestroyed();
		if(undefined !== this._search){
			return this._search;
		}
		const initialization = this._initialization ??=
			this._createSearch();
		try{
			const search = await initialization;
			this._assertNotDestroyed();
			this._search = search;
			this._initialization = undefined;
			return search;
		}
		catch(error){
			if(initialization === this._initialization){
				this._initialization = undefined;
			}
			throw error;
		}
	}

	_invalidate():void{
		this._assertNotDestroyed();
		this._search?._invalidate();
	}

	protected async _createSearch():Promise<PetQueryServerDatabasePetSearch>{
		const {
			PetQueryServerDatabasePetSearch
		} = await import('#petquery/server/database/pet/search.js');
		return new PetQueryServerDatabasePetSearch(this._path);
	}

	protected override async _destructor():Promise<void>{
		try{
			const search = this._search ?? await this._initialization;
			await search?.destructor();
		}
		catch(UNUSED_e){
		}
	}
};
