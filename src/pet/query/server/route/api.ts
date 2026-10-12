/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerConfigValues} from
	'#petquery/server/config.js';
import {PetQueryServerResponseSchemaError} from
	'#petquery/server/response/schema/error.js';
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

export class PetQueryServerRouteApi extends PetQueryServerRoute{
	register(app:Express.Express):void{
		const config = this._server._getConfig().route.api;
		if(true !== config.enabled){
			return;
		}

		app.all(
			'/api',
			this._server._authenticateUser.bind(this._server),
			PetQuerySchemaSearchRequest._handle.bind(
				this,
				this._handleSearch.bind(this,config.plugins)
			)
		);
		app.get(
			'/api/ping/get',
			PetQuerySchemaApiPingGetRequest._handle.bind(
				this,
				this._handlePing.bind(this)
			)
		);
		// Public so that peers can sync their server index.
		app.get(
			'/api/server/get',
			PetQuerySchemaApiServerGetRequest._handle.bind(
				this,
				this._handleListServer.bind(this)
			)
		);
		app.put(
			'/api/server/put/:uuid',
			this._server._authenticateAdmin.bind(this._server),
			PetQuerySchemaApiServerPutRequest._handle.bind(
				this,
				this._handleAddServer.bind(this)
			)
		);
		app.delete(
			'/api/server/delete/:uuid',
			this._server._authenticateAdmin.bind(this._server),
			PetQuerySchemaApiServerDeleteRequest._handle.bind(
				this,
				this._handleDeleteServer.bind(this)
			)
		);
		app.get(
			'/api/config/get',
			this._server._authenticateAdmin.bind(this._server),
			PetQuerySchemaApiConfigGetRequest._handle.bind(
				this,
				this._handleGetConfig.bind(this)
			)
		);
		app.put(
			'/api/config/put',
			this._server._authenticateAdmin.bind(this._server),
			PetQuerySchemaApiConfigPutRequest._handle.bind(
				this,
				this._handlePutConfig.bind(this)
			)
		);
	}

	protected async _handlePing(
		UNUSED_request:PetQuerySchemaApiPingGetRequest
	):Promise<PetQuerySchemaApiPingGetResponse>{
		return new PetQuerySchemaApiPingGetResponse(200,{
			success:true,
			error:[],
			data:{uuid:this._server._getUuid()}
		});
	}

	protected async _handleListServer(
		UNUSED_request:PetQuerySchemaApiServerGetRequest
	):Promise<PetQuerySchemaApiServerGetResponse>{
		const servers =
			await this._server._getServerIndex().getServerList();
		const data = [];

		for(const [uuid,uri] of servers){
			data.push({uuid,uri});
		}
		return new PetQuerySchemaApiServerGetResponse(200,{
			success:true,
			error:[],
			data
		});
	}

	protected async _handleAddServer(
		request:PetQuerySchemaApiServerPutRequest
	):Promise<PetQuerySchemaApiServerPutResponse>{
		await this._server._getServerIndex().addServer(
			request.getUuid(),
			request.getUri()
		);
		return new PetQuerySchemaApiServerPutResponse(200,{
			success:true,
			error:[]
		});
	}

	protected async _handleDeleteServer(
		request:PetQuerySchemaApiServerDeleteRequest
	):Promise<PetQuerySchemaApiServerDeleteResponse>{
		await this._server._getServerIndex().deleteServer(request.getUuid());
		return new PetQuerySchemaApiServerDeleteResponse(200,{
			success:true,
			error:[]
		});
	}

	// Returns the running values, the saved values (applied on restart)
	// and the plugin names that route.api.plugins may contain.
	protected async _handleGetConfig(
		UNUSED_request:PetQuerySchemaApiConfigGetRequest
	):Promise<PetQuerySchemaApiConfigGetResponse>{
		const configFile = this._server._getConfigFile();
		const active = PetQueryServerConfig.fromServerConfig(
			this._server._getConfig()
		);
		let saved:PetQueryServerConfigValues|null = null;
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
		request:PetQuerySchemaApiConfigPutRequest
	):Promise<
		PetQuerySchemaApiConfigPutResponse|PetQueryServerResponseSchemaError
	>{
		const configFile = this._server._getConfigFile();
		let saved:PetQueryServerConfigValues;

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
