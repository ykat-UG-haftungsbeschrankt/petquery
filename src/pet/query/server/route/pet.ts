/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import {PetQueryServerRoute, PetQueryServerRouteAccessGroup} from '#petquery/server/route.js';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';

import type {PetQuerySchemaApiPetGetRequest} from '#schema/api/pet/get/request.js';

export class PetQueryServerRoutePet extends PetQueryServerRoute{
	register():void{
		if(true !== this.getServer()._getConfig().route.api.enabled){
			return;
		}
		this.getServer().get(
			'/api/pets',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.User),
			PetQuerySchemaApiPetGetRequest._handle.bind(
				this,
				this._handleList.bind(this)
			)
		);
		this.getServer().post(
			'/api/pets',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.User),
			this._wrap(this._handleCreate.bind(this))
		);
		this.getServer().get(
			'/api/pets/:pet_id',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.User),
			this._wrap(this._handleGet.bind(this))
		);
		this.getServer().put(
			'/api/pets/:pet_id',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.User),
			this._wrap(this._handleUpdate.bind(this))
		);
		this.getServer().delete(
			'/api/pets/:pet_id',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.User),
			this._wrap(this._handleDelete.bind(this))
		);
	}

	protected async _handleList(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._sendSuccess(res,await this.getServer()._getPetStore().list());
	}

	protected async _handleGet(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const pet = await this.getServer()._getPetStore().get(
			this._getParam(req,'pet_id')
		);
		if(null === pet){
			this._sendError(res,404,['Pet not found']);
			return;
		}
		this._sendSuccess(res,pet);
	}

	protected async _handleCreate(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const pet = await this.getServer()._getPetStore().create(
			this.getServer()._getPetStore().parse(req.body)
		);
		this._sendSuccess(res,pet);
	}

	protected async _handleUpdate(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const pet = await this.getServer()._getPetStore().update(
			this._getParam(req,'pet_id'),
			this.getServer()._getPetStore().parse(req.body)
		);
		this._sendSuccess(res,pet);
	}

	protected async _handleDelete(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		await this.getServer()._getPetStore().remove(
			this._getParam(req,'pet_id')
		);
		this._sendSuccess(res,null);
	}

	protected _getParam(
		req:PetQueryServerRequest,
		name:utf8_t
	):utf8_t{
		const value = req.params[name];
		if('string' !== typeof value || '' === value){
			throw new Error(`${name} is required`);
		}
		return value;
	}

	protected _sendSuccess(
		res:PetQueryServerResponse,
		data:unknown
	):void{
		res.set('Cache-Control','no-store');
		res.status(200).json({success:true,error:[],data});
	}

	protected _sendError(
		res:PetQueryServerResponse,
		status:uint16_t,
		error:Array<utf8_t>
	):void{
		res.set('Cache-Control','no-store');
		res.status(status).json({success:false,error,data:[]});
	}

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
};
