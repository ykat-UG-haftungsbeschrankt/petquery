/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {
	PetQueryServerRoute,
	PetQueryServerRouteAccessGroup
} from '#petquery/server/route.js';
import {
	PetQuerySchemaApiPetGetRequest,
	type PetQuerySchemaApiPetGetRequestType
} from '#schema/api/pet/get/request.js';
import type {PetQuerySchemaApiPetGetResponseType} from
	'#schema/api/pet/get/response.js';
import {
	PetQuerySchemaApiPetGetEntryRequest,
	type PetQuerySchemaApiPetGetEntryRequestType
} from '#schema/api/pet/get/entry/request.js';
import type {PetQuerySchemaApiPetGetEntryResponseType} from
	'#schema/api/pet/get/entry/response.js';
import {
	PetQuerySchemaApiPetPostRequest,
	type PetQuerySchemaApiPetPostRequestType
} from '#schema/api/pet/post/request.js';
import type {PetQuerySchemaApiPetPostResponseType} from
	'#schema/api/pet/post/response.js';
import {
	PetQuerySchemaApiPetPutRequest,
	type PetQuerySchemaApiPetPutRequestType
} from '#schema/api/pet/put/request.js';
import type {PetQuerySchemaApiPetPutResponseType} from
	'#schema/api/pet/put/response.js';
import {
	PetQuerySchemaApiPetDeleteRequest,
	type PetQuerySchemaApiPetDeleteRequestType
} from '#schema/api/pet/delete/request.js';
import type {PetQuerySchemaApiPetDeleteResponseType} from
	'#schema/api/pet/delete/response.js';

export class PetQueryServerRoutePet extends PetQueryServerRoute{
	register():void{
		if(true !== this.getServer()._getConfig().route.api.enabled){
			return;
		}
		const accessGroup = PetQueryServerRouteAccessGroup.User;
		this.getServer().get(
			'/api/pets',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetGetRequest._handle.bind(
				this,
				this._handleList.bind(this)
			)
		);
		this.getServer().post(
			'/api/pets',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetPostRequest._handle.bind(
				this,
				this._handleCreate.bind(this)
			)
		);
		this.getServer().get(
			'/api/pets/:pet_id',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetGetEntryRequest._handle.bind(
				this,
				this._handleGet.bind(this)
			)
		);
		this.getServer().put(
			'/api/pets/:pet_id',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetPutRequest._handle.bind(
				this,
				this._handleUpdate.bind(this)
			)
		);
		this.getServer().delete(
			'/api/pets/:pet_id',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetDeleteRequest._handle.bind(
				this,
				this._handleDelete.bind(this)
			)
		);
	}

	protected async _handleList(
		UNUSED_request:PetQuerySchemaApiPetGetRequestType
	):Promise<PetQuerySchemaApiPetGetResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		return database.serverPetGetEntries();
	}

	protected async _handleGet(
		request:PetQuerySchemaApiPetGetEntryRequestType
	):Promise<PetQuerySchemaApiPetGetEntryResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		return database.serverPetGet(request.pet_id);
	}

	protected async _handleCreate(
		request:PetQuerySchemaApiPetPostRequestType
	):Promise<PetQuerySchemaApiPetPostResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetAdd(request);
		return request;
	}

	protected async _handleUpdate(
		request:PetQuerySchemaApiPetPutRequestType
	):Promise<PetQuerySchemaApiPetPutResponseType>{
		const {pet_id:petId,...pet} = request;
		if(petId !== pet.petId){
			throw new Error('petId must match the pet_id URL parameter');
		}
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetGet(petId);
		await database.serverPetAdd(pet);
		return pet;
	}

	protected async _handleDelete(
		request:PetQuerySchemaApiPetDeleteRequestType
	):Promise<PetQuerySchemaApiPetDeleteResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetRemove(request.pet_id);
		return null;
	}
/*
	protected override _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : util.inspect(error);
	}



	// Searches the plugins in pluginFilter, all if null. A circular query
	// gets an unsuccessful result instead of being forwarded again.
	protected async _handleSearch(
		pluginFilter:Set<string>|null,
		request:PetQuerySchemaSearchRequest
	):Promise<PetQuerySchemaSearchResponse>{
		const query = request.getPluginQuery(this._server._getUuid());

		if(query.isCircularQuery()){
			return PetQuerySchemaSearchResponse.fromResult(
				200,
				new PetQueryResult(
					false,
					['Circular query detected'],
					new PetQueryResultData([])
				)
			);
		}
		const result = await this._query(query,pluginFilter);
		result.getData().append(
			new PetQueryResultData(
				await this._server._getPetStore().search(request.getQuery())
			)
		);
		return PetQuerySchemaSearchResponse.fromResult(200,result);
	}

	async _query(
		 query:PetQueryPluginQuery
		,pluginFilter:Set<string>|null
	):Promise<PetQueryResult>{
		const config = this._server.getConfig();
		const promises = [];
		for(const plugin of this._server.getPlugins(pluginFilter)){
			promises.push(plugin.query(query));
		}
		const settled = await Promise.allSettled(promises);

		let success = true;
		const error:Array<json_string_t> = [];
		const data:Array<PetQueryResultDataEntry> = [];
		for(const item of settled){
			if('rejected' === item.status){
				error.push(util.inspect(item.reason));
				continue;
			}
			success = success && item.value.isSuccess();
			error.push(...item.value.getError());
			data.push(...item.value.getData().getData().slice(
				0,
				config.max_results_per_module
			));
		}

		return new PetQueryResult(
			success,
			error,
			new PetQueryResultData(data.slice(0,config.max_results_total))
		);
	}
		*/
};
