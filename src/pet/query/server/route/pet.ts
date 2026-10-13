/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';

type PetQueryServerRoutePetHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse
)=>Promise<void>;

export class PetQueryServerRoutePet extends PetQueryServerRoute{
	register():void{
		if(true !== this.getServer()._getConfig().route.api.enabled){
			return;
		}
		this.getServer().get(
			'/api/pets',
			this._authenticateUser.bind(this),
			this._wrap(this._handleList.bind(this))
		);
		this.getServer().post(
			'/api/pets',
			this._authenticateUser.bind(this),
			this._wrap(this._handleCreate.bind(this))
		);
		this.getServer().get(
			'/api/pets/:pet_id',
			this._authenticateUser.bind(this),
			this._wrap(this._handleGet.bind(this))
		);
		this.getServer().put(
			'/api/pets/:pet_id',
			this._authenticateUser.bind(this),
			this._wrap(this._handleUpdate.bind(this))
		);
		this.getServer().delete(
			'/api/pets/:pet_id',
			this._authenticateUser.bind(this),
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
};
