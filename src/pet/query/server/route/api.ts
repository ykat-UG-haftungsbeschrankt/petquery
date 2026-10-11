/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import util from 'node:util';
import {validate as uuidValidate} from 'uuid';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQueryTypes} from '#petquery/types.js';
import {PetQueryServerCallbackNext} from
	'#petquery/server/callback/next.js';
import {PetQueryServerCallbackMergeRequestParams} from
	'#petquery/server/callback/merge/request/params.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';
import { PetQueryResultData } from '#petquery/plugin/result.js';
import { PetQueryResult } from '#petquery/result.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerConfigValues} from
	'#petquery/server/config.js';

export class PetQueryServerRouteApi extends PetQueryServerRoute{
	register(app:Express.Express):void{
		const config = this._server._getConfig().route.api;
		if(true !== config.enabled){
			return;
		}

		const mergeRequestParams =
			new PetQueryServerCallbackMergeRequestParams(this._server);
		const authenticate =
			config.authenticate ?? PetQueryServerCallbackNext.handle;
		app.all(
			'/api',
			authenticate,
			mergeRequestParams.handle.bind(mergeRequestParams),
			this._handle.bind(this)
		);
		app.get(
			'/api/ping',
			this._handlePing.bind(this)
		);
		// Public so that peers can sync their server index.
		app.get(
			'/api/server',
			this._handleListServer.bind(this)
		);
		app.put(
			'/api/server/:uuid',
			authenticate,
			this._handleAddServer.bind(this)
		);
		app.delete(
			'/api/server/:uuid',
			authenticate,
			this._handleDeleteServer.bind(this)
		);
		app.get(
			'/api/config',
			authenticate,
			this._handleGetConfig.bind(this)
		);
		app.put(
			'/api/config',
			authenticate,
			this._handlePutConfig.bind(this)
		);
	}

	// Returns the running values, the saved values (applied on restart)
	// and the plugin names that route.api.plugins may contain.
	protected async _handleGetConfig(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
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
		res.set('Cache-Control','no-store');
		res.json({
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

	protected async _handlePutConfig(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const configFile = this._server._getConfigFile();

		res.set('Cache-Control','no-store');
		try{
			configFile.parse(req.body);
		}catch(error){
			res.status(400).json({
				success:false,
				error:[this._getErrorMessage(error)]
			});
			return;
		}
		try{
			const saved = await configFile.save(req.body);
			res.json({success:true,error:[],data:{saved}});
		}catch(error){
			this._sendServerError(res,500,error);
		}
	}

	protected _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : String(error);
	}

	protected _handlePing(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):void{
		res.json({
			success:true,
			error:[],
			data:{uuid:this._server._getUuid()}
		});
	}

	protected async _handleListServer(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			const servers =
				await this._server._getServerIndex().getServerList();
			const data = [];
			for(const [uuid,uri] of servers){
				data.push({uuid,uri});
			}
			res.json({success:true,error:[],data});
		}catch(error){
			this._sendServerError(res,500,error);
		}
	}

	protected async _handleAddServer(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const uuid = this._getUuidParam(req);
		const uri:unknown = req.body?.uri;
		if(null === uuid){
			this._sendServerError(res,400,'Invalid server UUID');
			return;
		}
		if(!PetQueryTypes.isString(uri) || !URL.canParse(uri as string)){
			this._sendServerError(res,400,'Invalid or missing server URI');
			return;
		}
		try{
			await this._server._getServerIndex().addServer(
				uuid,
				uri as uri_t
			);
			res.json({success:true,error:[]});
		}catch(error){
			this._sendServerError(res,500,error);
		}
	}

	protected async _handleDeleteServer(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const uuid = this._getUuidParam(req);
		if(null === uuid){
			this._sendServerError(res,400,'Invalid server UUID');
			return;
		}
		try{
			await this._server._getServerIndex().deleteServer(uuid);
			res.json({success:true,error:[]});
		}catch(error){
			this._sendServerError(res,500,error);
		}
	}

	protected _getUuidParam(req:PetQueryServerRequest):uuid_t|null{
		const uuid:unknown = req.params.uuid;
		if(!PetQueryTypes.isString(uuid) || !uuidValidate(uuid as string)){
			return null;
		}
		return uuid as uuid_t;
	}

	protected _sendServerError(
		res:PetQueryServerResponse,
		status:uint16_t,
		error:unknown
	):void{
		res.status(status).json({
			success:false,
			error:[util.inspect(error)]
		});
	}

	protected async _handle(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			const pluginNames = this._server._getConfig().route.api.plugins;

			if(undefined === req.petQueryPluginQuery){
				throw new Error(`req.petQueryPluginQuery is undefined`);
			}

			if(req.petQueryPluginQuery.isCircularQuery()){
				throw new Error(`Circular query detected`);
			}

			const result = await this._query(
				 req.petQueryPluginQuery
				,pluginNames
			);
			res.json(result.toJson());
		}catch(error){
			const result = new PetQueryResult(
				false,
				[util.inspect(error)],
				new PetQueryResultData([])
			);
			res.json(result.toJson());
		}
	}
};
