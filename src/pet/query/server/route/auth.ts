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
import type {PetQueryServerAuthGroup} from '#petquery/server/auth.js';

type PetQueryServerRouteAuthHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse
)=>Promise<void>;

export class PetQueryServerRouteAuth extends PetQueryServerRoute{
	register(app:Express.Express):void{
		app.get('/auth/mode',this._wrap(this._handleMode.bind(this)));
		app.get('/auth/session',this._wrap(this._handleSession.bind(this)));
		app.post('/auth/login',this._wrap(this._handleLogin.bind(this)));
		app.post('/auth/logout',this._wrap(this._handleLogout.bind(this)));
		app.get(
			'/auth/oidc/login',
			this._wrap(this._handleOidcLogin.bind(this))
		);
		app.get(
			'/auth/oidc/callback',
			this._wrap(this._handleOidcCallback.bind(this))
		);
		app.get(
			'/auth/users',
			this._server._authenticateAdmin.bind(this._server),
			this._wrap(this._handleListUsers.bind(this))
		);
		app.post(
			'/auth/users',
			this._server._authenticateAdmin.bind(this._server),
			this._wrap(this._handleCreateUser.bind(this))
		);
		app.put(
			'/auth/users/:username',
			this._server._authenticateAdmin.bind(this._server),
			this._wrap(this._handleUpdateUser.bind(this))
		);
		app.delete(
			'/auth/users/:username',
			this._server._authenticateAdmin.bind(this._server),
			this._wrap(this._handleDeleteUser.bind(this))
		);
	}

	protected _wrap(
		handler:PetQueryServerRouteAuthHandler
	):PetQueryServerRouteAuthHandler{
		return async (req,res)=>{
			try{
				await handler(req,res);
			}
			catch(error){
				this._sendError(res,400,[this._getErrorMessage(error)]);
			}
		};
	}

	protected async _handleMode(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._sendSuccess(res,{mode:this._server._getAuth().getMode()});
	}

	protected async _handleSession(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const user = await this._server._getAuth().authenticate(req);
		if(null === user){
			this._sendError(res,401,['Authentication required']);
			return;
		}
		this._sendSuccess(res,{user});
	}

	protected async _handleLogin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const user = await this._server._getAuth().createLoginSession(req,res);
		this._sendSuccess(res,{user});
	}

	protected async _handleLogout(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		await this._server._getAuth().logout(req,res);
		this._sendSuccess(res,null);
	}

	protected async _handleOidcLogin(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if('oidc' !== this._server._getAuth().getMode()){
			this._sendError(res,400,['OpenID Connect is not enabled']);
			return;
		}
		res.redirect((await this._server._getAuth().getOidcLoginUrl()).href);
	}

	protected async _handleOidcCallback(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const user = await this._server._getAuth().handleOidcCallback(req,res);
		const section = 'admin' === user.group ? 'config' : 'pets';
		res.redirect(`/admin/admin/${section}`);
	}

	protected async _handleListUsers(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		this._sendSuccess(res,await this._server._getAuth().listUsers());
	}

	protected async _handleCreateUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if('lmdb' !== this._server._getAuth().getMode()
		&& 'bearer' !== this._server._getAuth().getMode()){
			this._sendError(res,403,['User management is read-only']);
			return;
		}
		const user = await this._server._getAuth().createUser(
			this._getCreateUser(req)
		);
		this._sendSuccess(res,user);
	}

	protected async _handleUpdateUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if('lmdb' !== this._server._getAuth().getMode()
		&& 'bearer' !== this._server._getAuth().getMode()){
			this._sendError(res,403,['User management is read-only']);
			return;
		}
		const user = await this._server._getAuth().updateUser(
			this._getParam(req,'username'),
			this._getUpdateUser(req)
		);
		this._sendSuccess(res,user);
	}

	protected async _handleDeleteUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if('lmdb' !== this._server._getAuth().getMode()
		&& 'bearer' !== this._server._getAuth().getMode()){
			this._sendError(res,403,['User management is read-only']);
			return;
		}
		await this._server._getAuth().deleteUser(
			this._getParam(req,'username')
		);
		this._sendSuccess(res,null);
	}

	protected _getCreateUser(req:PetQueryServerRequest):{
		username:utf8_t;
		displayName:utf8_t;
		group:PetQueryServerAuthGroup;
		password:utf8_t;
	}{
		const body = this._getBody(req);
		return {
			username:this._getString(body,'username'),
			displayName:this._getString(body,'displayName'),
			group:this._getGroup(body.group),
			password:this._getString(body,'password')
		};
	}

	protected _getUpdateUser(req:PetQueryServerRequest):{
		displayName:utf8_t;
		group:PetQueryServerAuthGroup;
		password:utf8_t;
	}{
		const body = this._getBody(req);
		return {
			displayName:this._getString(body,'displayName'),
			group:this._getGroup(body.group),
			password:this._getString(body,'password')
		};
	}

	protected _getBody(
		req:PetQueryServerRequest
	):Record<utf8_t,unknown>{
		const body = req.body;
		if('object' !== typeof body || null === body || Array.isArray(body)){
			throw new Error('JSON body is required');
		}
		return body;
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

	protected _getString(
		body:Record<utf8_t,unknown>,
		name:utf8_t
	):utf8_t{
		const value = body[name];
		if('string' !== typeof value){
			throw new Error(`${name} is required`);
		}
		return value;
	}

	protected _getGroup(value:unknown):PetQueryServerAuthGroup{
		if('admin' === value || 'user' === value){
			return value;
		}
		throw new Error('group must be admin or user');
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
