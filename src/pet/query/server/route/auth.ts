/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {
	PetQueryServerRoute,
	PetQueryServerRouteAccessGroup,
	type PetQueryServerNext
} from '#petquery/server/route.js';
import type {PetQueryServerRequest} from '#petquery/server/request.js';
import type {PetQueryServerResponse} from '#petquery/server/response.js';
import {
	PetQuerySchemaApiAuthModeGetRequest,
	type PetQuerySchemaApiAuthModeGetRequestType
} from '#schema/api/auth/mode/get/request.js';
import type {PetQuerySchemaApiAuthModeGetResponseType} from
	'#schema/api/auth/mode/get/response.js';
import {
	PetQuerySchemaApiAuthSessionGetRequest,
	type PetQuerySchemaApiAuthSessionGetRequestType
} from '#schema/api/auth/session/get/request.js';
import type {PetQuerySchemaApiAuthSessionGetResponseType} from
	'#schema/api/auth/session/get/response.js';
import {
	PetQuerySchemaApiAuthLoginPostRequest,
	type PetQuerySchemaApiAuthLoginPostRequestType
} from '#schema/api/auth/login/post/request.js';
import type {PetQuerySchemaApiAuthLoginPostResponseType} from
	'#schema/api/auth/login/post/response.js';
import {
	PetQuerySchemaApiAuthLogoutPostRequest,
	type PetQuerySchemaApiAuthLogoutPostRequestType
} from '#schema/api/auth/logout/post/request.js';
import type {PetQuerySchemaApiAuthLogoutPostResponseType} from
	'#schema/api/auth/logout/post/response.js';
import {
	PetQuerySchemaApiAuthOidcLoginGetRequest,
	type PetQuerySchemaApiAuthOidcLoginGetRequestType
} from '#schema/api/auth/oidc/login/get/request.js';
import {
	PetQuerySchemaApiAuthOidcCallbackGetRequest,
	type PetQuerySchemaApiAuthOidcCallbackGetRequestType
} from '#schema/api/auth/oidc/callback/get/request.js';
import {
	PetQuerySchemaApiAuthUsersGetRequest,
	type PetQuerySchemaApiAuthUsersGetRequestType
} from '#schema/api/auth/users/get/request.js';
import type {PetQuerySchemaApiAuthUsersGetResponseType} from
	'#schema/api/auth/users/get/response.js';
import {
	PetQuerySchemaApiAuthUsersPostRequest,
	type PetQuerySchemaApiAuthUsersPostRequestType
} from '#schema/api/auth/users/post/request.js';
import type {PetQuerySchemaApiAuthUsersPostResponseType} from
	'#schema/api/auth/users/post/response.js';
import {
	PetQuerySchemaApiAuthUsersPutRequest,
	type PetQuerySchemaApiAuthUsersPutRequestType
} from '#schema/api/auth/users/put/request.js';
import type {PetQuerySchemaApiAuthUsersPutResponseType} from
	'#schema/api/auth/users/put/response.js';
import {
	PetQuerySchemaApiAuthUsersDeleteRequest,
	type PetQuerySchemaApiAuthUsersDeleteRequestType
} from '#schema/api/auth/users/delete/request.js';
import type {PetQuerySchemaApiAuthUsersDeleteResponseType} from
	'#schema/api/auth/users/delete/response.js';

export class PetQueryServerRouteAuth extends PetQueryServerRoute{
	register():void{
		this.getServer().get(
			'/auth/mode',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthModeGetRequest._handle.bind(
				this,
				this._handleMode.bind(this)
			)
		);
		this.getServer().get(
			'/auth/session',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthSessionGetRequest._handle.bind(
				this,
				this._handleSession.bind(this)
			)
		);
		this.getServer().post(
			'/auth/login',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthLoginPostRequest._handle.bind(
				this,
				this._handleLogin.bind(this)
			)
		);
		this.getServer().post(
			'/auth/logout',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthLogoutPostRequest._handle.bind(
				this,
				this._handleLogout.bind(this)
			)
		);
		this.getServer().get(
			'/auth/oidc/login',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthOidcLoginGetRequest._handle.bind(
				this,
				this._handleOidcLogin.bind(this)
			)
		);
		this.getServer().get(
			'/auth/oidc/callback',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthOidcCallbackGetRequest._handle.bind(
				this,
				this._handleOidcCallback.bind(this)
			)
		);
		this.getServer().get(
			'/auth/users',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthUsersGetRequest._handle.bind(
				this,
				this._handleListUsers.bind(this)
			)
		);
		this.getServer().post(
			'/auth/users',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersPostRequest._handle.bind(
				this,
				this._handleCreateUser.bind(this)
			)
		);
		this.getServer().put(
			'/auth/users/:username',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersPutRequest._handle.bind(
				this,
				this._handleUpdateUser.bind(this)
			)
		);
		this.getServer().delete(
			'/auth/users/:username',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersDeleteRequest._handle.bind(
				this,
				this._handleDeleteUser.bind(this)
			)
		);
	}

	protected _requireWritableUsers(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		const mode = this.getServer().getAuth().getMode();
		if('lmdb' !== mode && 'bearer' !== mode){
			res.sendAuthForbiddenError('User management is read-only');
			return;
		}
		next();
	}

	protected async _handleMode(
		UNUSED_request:PetQuerySchemaApiAuthModeGetRequestType
	):Promise<PetQuerySchemaApiAuthModeGetResponseType>{
		return {mode:this.getServer().getAuth().getMode()};
	}

	protected async _handleSession(
		UNUSED_request:PetQuerySchemaApiAuthSessionGetRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiAuthSessionGetResponseType|void>{
		const user = await this.getServer().getAuth().authenticate(req);
		if(null === user){
			res.sendAuthUnauthorizedError('Authentication required');
			return;
		}
		return {user};
	}

	protected async _handleLogin(
		UNUSED_request:PetQuerySchemaApiAuthLoginPostRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiAuthLoginPostResponseType>{
		const user = await this.getServer().getAuth().createLoginSession(
			req,
			res
		);
		return {user};
	}

	protected async _handleLogout(
		UNUSED_request:PetQuerySchemaApiAuthLogoutPostRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiAuthLogoutPostResponseType>{
		await this.getServer().getAuth().logout(req,res);
		return null;
	}

	protected async _handleOidcLogin(
		UNUSED_request:PetQuerySchemaApiAuthOidcLoginGetRequestType,
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if('oidc' !== this.getServer().getAuth().getMode()){
			res.sendAuthUnauthorizedError('OpenID Connect is not enabled');
			return;
		}
		res.redirectUrl(
			(await this.getServer().getAuth().getOidcLoginUrl()).href
		);
	}

	protected async _handleOidcCallback(
		UNUSED_request:PetQuerySchemaApiAuthOidcCallbackGetRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const user = await this.getServer().getAuth().handleOidcCallback(
			req,
			res
		);
		const section = 'admin' === user.group ? 'config' : 'pets';
		res.redirectUrl(`/gui/admin/${section}`);
	}

	protected async _handleListUsers(
		UNUSED_request:PetQuerySchemaApiAuthUsersGetRequestType
	):Promise<PetQuerySchemaApiAuthUsersGetResponseType>{
		return this.getServer().getAuth().listUsers();
	}

	protected async _handleCreateUser(
		request:PetQuerySchemaApiAuthUsersPostRequestType
	):Promise<PetQuerySchemaApiAuthUsersPostResponseType>{
		return this.getServer().getAuth().createUser({
			username:request.username,
			displayName:request.displayName,
			group:request.group,
			password:request.password
		});
	}

	protected async _handleUpdateUser(
		request:PetQuerySchemaApiAuthUsersPutRequestType
	):Promise<PetQuerySchemaApiAuthUsersPutResponseType>{
		return this.getServer().getAuth().updateUser(request.username,{
			displayName:request.displayName,
			group:request.group,
			password:request.password
		});
	}

	protected async _handleDeleteUser(
		request:PetQuerySchemaApiAuthUsersDeleteRequestType
	):Promise<PetQuerySchemaApiAuthUsersDeleteResponseType>{
		await this.getServer().getAuth().deleteUser(request.username);
		return null;
	}
};
