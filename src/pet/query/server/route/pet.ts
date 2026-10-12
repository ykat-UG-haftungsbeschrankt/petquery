/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import util from 'node:util';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

type PetQueryServerRoutePetHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse
)=>Promise<void>;

export class PetQueryServerRoutePet extends PetQueryServerRoute{
	register(app:Express.Express):void{
		if(true !== this._server._getConfig().route.api.enabled){
			return;
		}
		app.get(
			'/api/pets',
			this._server._authenticateUser.bind(this._server),
			this._wrap(this._handleList.bind(this))
		);
		app.post(
			'/api/pets',
			this._server._authenticateUser.bind(this._server),
			this._wrap(this._handleCreate.bind(this))
		);
		app.get(
			'/api/pets/:pet_id',
			this._server._authenticateUser.bind(this._server),
			this._wrap(this._handleGet.bind(this))
		);
		app.put(
			'/api/pets/:pet_id',
			this._server._authenticateUser.bind(this._server),
			this._wrap(this._handleUpdate.bind(this))
		);
		app.delete(
			'/api/pets/:pet_id',
			this._server._authenticateUser.bind(this._server),
			this._wrap(this._handleDelete.bind(this))
		);
	}

	protected _wrap(
		handler:PetQueryServerRoutePetHandler
	):PetQueryServerRoutePetHandler{
		return async (req,res)=>{
			try{
				await handler(req,res);
			}
			catch(error){
				this._sendError(res,400,[this._getErrorMessage(error)]);
			}
		};
	}

	protected async _handleList(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._sendSuccess(res,await this._server._getPetStore().list());
	}

	protected async _handleGet(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const pet = await this._server._getPetStore().get(
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
		const pet = await this._server._getPetStore().create(
			this._server._getPetStore().parse(req.body)
		);
		this._sendSuccess(res,pet);
	}

	protected async _handleUpdate(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const pet = await this._server._getPetStore().update(
			this._getParam(req,'pet_id'),
			this._server._getPetStore().parse(req.body)
		);
		this._sendSuccess(res,pet);
	}

	protected async _handleDelete(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		await this._server._getPetStore().remove(
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
		res.status(status).json({success:false,error,data:null});
	}

	protected override _getErrorMessage(error:unknown):utf8_t{
		return error instanceof Error ? error.message : util.inspect(error);
	}
};
