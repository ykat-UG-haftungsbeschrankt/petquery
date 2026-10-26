/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryConfig } from '#petquery/config.js';
import { PetQuerySchemaApiConfigGetRequest } from '#schema/api/config/get/request.js';
import { PetQuerySchemaApiConfigPutRequest } from '#schema/api/config/put/request.js';
import { PetQuerySchemaApiPingGetRequest } from '#schema/api/ping/get/request.js';
import { PetQuerySchemaApiServerDeleteRequest } from '#schema/api/server/delete/request.js';
import { PetQuerySchemaApiServerGetRequest } from '#schema/api/server/get/request.js';
import { PetQuerySchemaApiServerPutRequest } from '#schema/api/server/put/request.js';
import { PetQueryServerRoute } from '#petquery/server/route.js';
import { PetQueryServerRouteAccessGroup } from '#petquery/server/route.js';

import type { PetQuerySchemaApiConfigGetRequestType } from '#schema/api/config/get/request.js';
import type { PetQuerySchemaApiConfigGetResponseType } from '#schema/api/config/get/response.js';
import type { PetQuerySchemaApiConfigPutRequestType } from '#schema/api/config/put/request.js';
import type { PetQuerySchemaApiConfigPutResponseType } from '#schema/api/config/put/response.js';
import type { PetQuerySchemaApiPingGetRequestType } from '#schema/api/ping/get/request.js';
import type { PetQuerySchemaApiPingGetResponseType } from '#schema/api/ping/get/response.js';
import type { PetQuerySchemaApiServerDeleteRequestType } from '#schema/api/server/delete/request.js';
import type { PetQuerySchemaApiServerDeleteResponseType } from '#schema/api/server/delete/response.js';
import type { PetQuerySchemaApiServerGetRequestType } from '#schema/api/server/get/request.js';
import type { PetQuerySchemaApiServerGetResponseType } from '#schema/api/server/get/response.js';
import type { PetQuerySchemaApiServerPutRequestType } from '#schema/api/server/put/request.js';
import type { PetQuerySchemaApiServerPutResponseType } from '#schema/api/server/put/response.js';

export class PetQueryServerRouteApi extends PetQueryServerRoute{
	register():void{
		const config = this.getServer()._getConfig().route.api;
		if(true !== config.enabled){
			return;
		}

		this.getServer().get(
			'/api/ping/get',
			PetQuerySchemaApiPingGetRequest.getHandle(
				this._handlePing.bind(this)
			)
		);
		// Public so that peers can sync their server index.
		this.getServer().get(
			'/api/server/get',
			PetQuerySchemaApiServerGetRequest.getHandle(
				this._handleListServer.bind(this)
			)
		);
		this.getServer().put(
			'/api/server/put/:gid',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiServerPutRequest.getHandle(
				this._handleAddServer.bind(this)
			)
		);
		this.getServer().delete(
			'/api/server/delete/:gid',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiServerDeleteRequest.getHandle(
				this._handleDeleteServer.bind(this)
			)
		);
		this.getServer().get(
			'/api/config/get',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiConfigGetRequest.getHandle(
				this._handleGetConfig.bind(this)
			)
		);
		this.getServer().put(
			'/api/config/put',
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiConfigPutRequest.getHandle(
				this._handlePutConfig.bind(this)
			)
		);
	}

	protected async _handlePing(
		UNUSED_request: PetQuerySchemaApiPingGetRequestType
	): Promise<PetQuerySchemaApiPingGetResponseType>{
		return {
			gid:this.getServer()._getUuid(),
			uri:this.getServer()._getConfig().api.endpoint
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
		await this.getServer()
			._getDatabase()
			.getDbIndex()
			.serverIndexAddServer({
				gid:request.gid,
				uri:request.uri
			});
		return [];
	}

	protected async _handleDeleteServer(
		request:PetQuerySchemaApiServerDeleteRequestType
	):Promise<PetQuerySchemaApiServerDeleteResponseType>{
		await this.getServer()
			._getDatabase()
			.getDbIndex()
			.serverIndexRemoveServer(request.gid);
		return [];
	}

	// Returns the running values, the saved values (applied on restart)
	// and the plugin names that route.api.plugins may contain.
	protected async _handleGetConfig(
		UNUSED_request:PetQuerySchemaApiConfigGetRequestType
	):Promise<PetQuerySchemaApiConfigGetResponseType>{
		const configFile = this.getServer()._getConfigFile();
		const active = configFile.fromServerConfig(
			this.getServer()._getConfig()
		);
		const saved = await configFile.load();
		return {
			active,
			saved,
			plugins:PetQueryConfig.getPluginNames()
		};
	}

	// Saves the values, applied on restart. Unknown plugin names get a 400.
	protected async _handlePutConfig(
		request:PetQuerySchemaApiConfigPutRequestType
	):Promise<PetQuerySchemaApiConfigPutResponseType>{
		const configFile = this.getServer()._getConfigFile();
		const saved = configFile.parse(request);
		await configFile.save(saved);
		return saved;
	}
};
