/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryServerRoute, PetQueryServerRouteAccessGroup} from '#petquery/server/route.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerConfigType} from
	'#petquery/server/config.js';
import {PetQueryServerResponseSchemaError} from
	'#petquery/server/response/schema.js';
import {PetQuerySchemaSearchRequest} from '#schema/search/request.js';
import {PetQuerySchemaApiPingGetRequest} from
	'#schema/api/ping/get/request.js';
import {PetQuerySchemaApiPingGetResponse} from
	'#schema/api/ping/get/response.js';
import {PetQuerySchemaApiServerGetRequest} from
	'#schema/api/server/get/request.js';
import {PetQuerySchemaApiServerGetResponse} from
	'#schema/api/server/get/response.js';
import {PetQuerySchemaApiServerPutRequest} from
	'#schema/api/server/put/request.js';
import {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';
import {PetQuerySchemaApiServerDeleteRequest} from
	'#schema/api/server/delete/request.js';
import {PetQuerySchemaApiServerDeleteResponse} from
	'#schema/api/server/delete/response.js';
import {PetQuerySchemaApiConfigGetRequest} from
	'#schema/api/config/get/request.js';
import {PetQuerySchemaApiConfigGetResponse} from
	'#schema/api/config/get/response.js';
import {PetQuerySchemaApiConfigPutRequest} from
	'#schema/api/config/put/request.js';
import {PetQuerySchemaApiConfigPutResponse} from
	'#schema/api/config/put/response.js';

import type {
	PetQuerySchemaApiServerGetRequestType
} from
	'#schema/api/server/get/request.js';
import type {
	PetQuerySchemaApiServerGetResponseType
} from
	'#schema/api/server/get/response.js';
import type {
	PetQuerySchemaApiServerPutRequestType
} from
	'#schema/api/server/put/request.js';
import type {
	PetQuerySchemaApiServerPutResponseType
} from
	'#schema/api/server/put/response.js';
import type {
	PetQuerySchemaApiServerDeleteRequestType
} from
	'#schema/api/server/delete/request.js';
import type {
	PetQuerySchemaApiServerDeleteResponseType
} from
	'#schema/api/server/delete/response.js';
import type {
	PetQuerySchemaApiConfigGetRequestType
} from
	'#schema/api/config/get/request.js';
import type {
	PetQuerySchemaApiConfigGetResponseType
} from
	'#schema/api/config/get/response.js';
import type {
	PetQuerySchemaApiConfigPutRequestType
} from
	'#schema/api/config/put/request.js';
import type {
	PetQuerySchemaApiConfigPutResponseType
} from
	'#schema/api/config/put/response.js';
import type {
	PetQuerySchemaApiPingGetRequestType
} from
	'#schema/api/ping/get/request.js';
import type {
	PetQuerySchemaApiPingGetResponseType
} from
	'#schema/api/ping/get/response.js';

export class PetQueryServerRouteApi extends PetQueryServerRoute{
	register():void{
		const config = this.getServer()._getConfig().route.api;
		if(true !== config.enabled){
			return;
		}

		this.getServer().all(
			'/api',
			this._authenticateUser.bind(this),
			PetQuerySchemaSearchRequest._handle.bind(
				this,
				this._handleSearch.bind(this,config.plugins)
			)
		);
		this.getServer().get(
			'/api/ping/get',
			PetQuerySchemaApiPingGetRequest._handle.bind(
				this,
				this._handlePing.bind(this)
			)
		);
		// Public so that peers can sync their server index.
		this.getServer().get(
			'/api/server/get',
			PetQuerySchemaApiServerGetRequest._handle.bind(
				this,
				this._handleListServer.bind(this)
			)
		);
		this.getServer().put(
			'/api/server/put/:uuid',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiServerPutRequest._handle.bind(
				this,
				this._handleAddServer.bind(this)
			)
		);
		this.getServer().delete(
			'/api/server/delete/:uuid',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiServerDeleteRequest._handle.bind(
				this,
				this._handleDeleteServer.bind(this)
			)
		);
		this.getServer().get(
			'/api/config/get',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiConfigGetRequest._handle.bind(
				this,
				this._handleGetConfig.bind(this)
			)
		);
		this.getServer().put(
			'/api/config/put',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiConfigPutRequest._handle.bind(
				this,
				this._handlePutConfig.bind(this)
			)
		);
	}

	protected async _handlePing(
		UNUSED_request: PetQuerySchemaApiPingGetRequestType
	): Promise<PetQuerySchemaApiPingGetResponseType>{
		return {
			
		};
	}

	protected async _handleListServer(
		UNUSED_request:PetQuerySchemaApiServerGetRequestType
	):Promise<PetQuerySchemaApiServerGetResponseType>{
		const servers = await this.getServer()
			._getDatabase()
			.getDbIndex()
			.serverIndexGetServerList()
		;
		return servers;
	}

	protected async _handleAddServer(
		request:PetQuerySchemaApiServerPutRequestType
	):Promise<PetQuerySchemaApiServerPutResponseType>{
		return await this.getServer()
			._getDatabase()
			.getDbIndex()
			.serverIndexAddServer(request);
	}

	protected async _handleDeleteServer(
		request:PetQuerySchemaApiServerDeleteRequestType
	):Promise<PetQuerySchemaApiServerDeleteResponseType>{
		return await this.getServer()
			._getDatabase()
			.getDbIndex()
			.serverIndexRemoveServer(request.uuid);
	}

	// Returns the running values, the saved values (applied on restart)
	// and the plugin names that route.api.plugins may contain.
	protected async _handleGetConfig(
		UNUSED_request:PetQuerySchemaApiConfigGetRequestType
	):Promise<PetQuerySchemaApiConfigGetResponseType>{
		const configFile = this.getServer()._getConfigFile();
		const active = PetQueryServerConfig.fromServerConfig(
			this.getServer()._getConfig()
		);
		let saved:PetQueryServerConfigType|null = null;
		let savedError:utf8_t|null = null;

		try{
			saved = await configFile.load();
		}catch(error){
			savedError = this._getErrorMessage(error);
		}
		return new PetQuerySchemaApiConfigGetResponse(200,{
			success:true,
			error:[],
			data:{
				active,
				saved,
				saved_error:savedError,
				plugins:configFile.getPluginNames()
			}
		});
	}

	// Saves the values, applied on restart. Unknown plugin names get a 400.
	protected async _handlePutConfig(
		request:PetQuerySchemaApiConfigPutRequestType
	):Promise<PetQuerySchemaApiConfigPutResponseType>{
		const configFile = this.getServer()._getConfigFile();
		let saved:PetQueryServerConfigType;

		try{
			saved = configFile.normalize(request.getConfig());
		}catch(error){
			return new PetQueryServerResponseSchemaError(
				400,
				[this._getErrorMessage(error)]
			);
		}
		await configFile.save(saved);
		return new PetQuerySchemaApiConfigPutResponse(200,{
			success:true,
			error:[],
			data:{saved}
		});
	}
};
