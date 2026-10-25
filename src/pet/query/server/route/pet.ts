/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaApiPetDeleteRequest } from '#schema/api/pet/delete/request.js';
import { PetQuerySchemaApiPetGetEntryRequest } from '#schema/api/pet/get/entry/request.js';
import { PetQuerySchemaApiPetGetRequest } from '#schema/api/pet/get/request.js';
import { PetQuerySchemaApiPetPostRequest } from '#schema/api/pet/post/request.js';
import { PetQuerySchemaApiPetPutRequest } from '#schema/api/pet/put/request.js';
import { PetQuerySchemaApiPetSearchRequest } from '#schema/api/pet/search/request.js';
import { PetQuerySchemaPluginResponse } from '#schema/plugin/response.js';
import { PetQueryServerRoute } from '#petquery/server/route.js';
import { PetQueryServerRouteAccessGroup } from '#petquery/server/route.js';
import { setTimeout as delay } from 'node:timers/promises';

import type { PetQueryPlugin } from '#petquery/plugin.js';
import type { PetQuerySchemaApiPetDeleteRequestType } from '#schema/api/pet/delete/request.js';
import type { PetQuerySchemaApiPetDeleteResponseType } from '#schema/api/pet/delete/response.js';
import type { PetQuerySchemaApiPetGetEntryRequestType } from '#schema/api/pet/get/entry/request.js';
import type { PetQuerySchemaApiPetGetEntryResponseType } from '#schema/api/pet/get/entry/response.js';
import type { PetQuerySchemaApiPetGetRequestType } from '#schema/api/pet/get/request.js';
import type { PetQuerySchemaApiPetGetResponseType } from '#schema/api/pet/get/response.js';
import type { PetQuerySchemaApiPetPostRequestType } from '#schema/api/pet/post/request.js';
import type { PetQuerySchemaApiPetPostResponseType } from '#schema/api/pet/post/response.js';
import type { PetQuerySchemaApiPetPutRequestType } from '#schema/api/pet/put/request.js';
import type { PetQuerySchemaApiPetPutResponseType } from '#schema/api/pet/put/response.js';
import type { PetQuerySchemaApiPetSearchRequestType } from '#schema/api/pet/search/request.js';
import type { PetQuerySchemaPluginRequestType } from '#schema/plugin/request.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

export class PetQueryServerRoutePet extends PetQueryServerRoute{
	register():void{
		if(true !== this.getServer()._getConfig().route.api.enabled){
			return;
		}
		const accessGroup = PetQueryServerRouteAccessGroup.User;
		this.getServer().post(
			'/api/pets/search',
			this._disableCache.bind(this),
			PetQuerySchemaApiPetSearchRequest.getHandle(
				this._handleSearch.bind(this)
			)
		);
		this.getServer().get(
			'/api/pets',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetGetRequest.getHandle(
				this._handleList.bind(this)
			)
		);
		this.getServer().post(
			'/api/pets',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetPostRequest.getHandle(
				this._handleCreate.bind(this)
			)
		);
		this.getServer().get(
			'/api/pets/:gid',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetGetEntryRequest.getHandle(
				this._handleGet.bind(this)
			)
		);
		this.getServer().put(
			'/api/pets/:gid',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetPutRequest.getHandle(
				this._handleUpdate.bind(this)
			)
		);
		this.getServer().delete(
			'/api/pets/:gid',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(accessGroup),
			PetQuerySchemaApiPetDeleteRequest.getHandle(
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
		return database.serverPetGet(request.gid);
	}

	protected async _handleCreate(
		request:PetQuerySchemaApiPetPostRequestType
	):Promise<PetQuerySchemaApiPetPostResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetAdd(request);
		return request;
	}

	protected async _handleUpdate(
		request:PetQuerySchemaApiPetPutRequestType,
		req:PetQueryServerRequest
	):Promise<PetQuerySchemaApiPetPutResponseType>{
		const body:unknown = req.body;
		if(null !== body && 'object' === typeof body
		&& 'gid' in body && request.gid !== body.gid){
			throw new Error('gid must match the gid URL parameter');
		}
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetGet(request.gid);
		await database.serverPetAdd(request);
		return request;
	}

	protected async _handleDelete(
		request:PetQuerySchemaApiPetDeleteRequestType
	):Promise<PetQuerySchemaApiPetDeleteResponseType>{
		const database = this.getServer()._getDatabase().getDbPet();
		await database.serverPetRemove(request.gid);
		return null;
	}
	protected async _handleSearch(
		request:PetQuerySchemaApiPetSearchRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiPetGetResponseType>{
		const searchQuery = request.query.trim();
		const files = [
			...(request.files ?? []),
			...req._getFiles().values()
		];
		if('' === searchQuery && 0 === files.length){
			throw new Error('Enter a microchip ID or select files.');
		}
		const server = this.getServer();
		const config = server._getConfig();
		const trace = request.tracerouteUuid ?? [];
		if(trace.includes(server._getUuid())){
			res.json({
				success:false,
				error:['Circular query detected'],
				data:[]
			});
			return [];
		}
		const query:PetQuerySchemaPluginRequestType = {
			query:searchQuery,
			bearer:'',
			files,
			serverUuid:server._getUuid(),
			tracerouteUuid:[...trace,server._getUuid()]
		};
		const plugins = server.getPlugins(config.route.api.plugins);
		const tasks:Array<Promise<PetQuerySchemaApiPetGetResponseType>> = [];
		for(const plugin of plugins){
			tasks.push(this._queryPlugin(plugin,query));
		}
		if('' !== searchQuery){
			tasks.push(
				server._getDatabase().getDbPet().serverPetSearch(searchQuery)
			);
		}
		const results = await Promise.allSettled(tasks);
		const data:PetQuerySchemaApiPetGetResponseType = [];
		const error:Array<utf8_t> = [];
		for(const result of results){
			if('rejected' === result.status){
				error.push(this._getErrorMessage(result.reason));
			}else{
				data.push(...result.value.slice(
					0,config.max_results_per_module
				));
			}
		}
		const limited = data.slice(0,config.max_results_total);
		// FIXME: Include plugin errors in the search response.
		return limited;
	}

	protected async _queryPlugin(
		plugin:PetQueryPlugin,
		query:PetQuerySchemaPluginRequestType
	):Promise<PetQuerySchemaApiPetGetResponseType>{
		const controller = new AbortController();
		try{
			const result = await Promise.race([
				plugin.query(query),
				this._pluginTimeout(
					plugin.getName(),plugin.getTimeout(),controller.signal
				)
			]);
			return PetQuerySchema.parse(
				PetQuerySchemaPluginResponse.getValidator(),result
			);
		}
		finally{
			controller.abort();
		}
	}

	protected async _pluginTimeout(
		name:utf8_t,
		timeout:milliseconds_t,
		signal:AbortSignal
	):Promise<never>{
		await delay(timeout,undefined,{signal});
		throw new Error(`Plugin "${name}" search timed out`);
	}
};
