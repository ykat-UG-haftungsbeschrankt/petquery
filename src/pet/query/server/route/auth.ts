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
			PetQuerySchemaApiAuthModeGetRequest.getHandle(
				this._handleMode.bind(this)
			)
		);
		this.getServer().get(
			'/auth/session',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthSessionGetRequest.getHandle(
				this._handleSession.bind(this)
			)
		);
		this.getServer().post(
			'/auth/login',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthLoginPostRequest.getHandle(
				this._handleLogin.bind(this)
			)
		);
		this.getServer().post(
			'/auth/logout',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthLogoutPostRequest.getHandle(
				this._handleLogout.bind(this)
			)
		);
		this.getServer().get(
			'/auth/oidc/login',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthOidcLoginGetRequest.getHandle(
				this._handleOidcLogin.bind(this)
			)
		);
		this.getServer().get(
			'/auth/oidc/callback',
			this._disableCache.bind(this),
			PetQuerySchemaApiAuthOidcCallbackGetRequest.getHandle(
				this._handleOidcCallback.bind(this)
			)
		);
		this.getServer().get(
			'/auth/users',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthUsersGetRequest.getHandle(
				this._handleListUsers.bind(this)
			)
		);
		this.getServer().post(
			'/auth/users',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersPostRequest.getHandle(
				this._handleCreateUser.bind(this)
			)
		);
		this.getServer().put(
			'/auth/users/:username',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersPutRequest.getHandle(
				this._handleUpdateUser.bind(this)
			)
		);
		this.getServer().delete(
			'/auth/users/:username',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			this._requireWritableUsers.bind(this),
			PetQuerySchemaApiAuthUsersDeleteRequest.getHandle(
				this._handleDeleteUser.bind(this)
			)
		);
		this.getServer().get(
			'/auth/providers/:provider/login',
			this._disableCache.bind(this),
			this._handleProviderLogin.bind(this)
		);
		this.getServer().get(
			'/auth/providers/:provider/callback',
			this._disableCache.bind(this),
			this._handleProviderCallback.bind(this)
		);
	}

	protected _requireWritableUsers(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		try{
			if(!this.getServer().getAuth().canManageUsers(
				this._getProvider(req)
			)){
				res.sendAuthForbiddenError('User management is read-only');
				return;
			}
			next();
		}
		catch(error){
			res.sendApiError(error);
		}
	}

	protected async _handleMode(
		UNUSED_request:PetQuerySchemaApiAuthModeGetRequestType
	):Promise<PetQuerySchemaApiAuthModeGetResponseType>{
		const auth = this.getServer().getAuth();
		return {mode:auth.getMode(),providers:auth.getProviders()};
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
		if(!this.getServer().getAuth().hasProvider('oidc')){
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
		request:PetQuerySchemaApiAuthUsersGetRequestType
	):Promise<PetQuerySchemaApiAuthUsersGetResponseType>{
		return this.getServer().getAuth().listUsers(request.provider);
	}

	protected async _handleCreateUser(
		request:PetQuerySchemaApiAuthUsersPostRequestType
	):Promise<PetQuerySchemaApiAuthUsersPostResponseType>{
		return this.getServer().getAuth().createUser({
			username:request.username,
			displayName:request.displayName,
			group:request.group,
			password:request.password
		},request.provider);
	}

	protected async _handleUpdateUser(
		request:PetQuerySchemaApiAuthUsersPutRequestType
	):Promise<PetQuerySchemaApiAuthUsersPutResponseType>{
		return this.getServer().getAuth().updateUser(request.username,{
			displayName:request.displayName,
			group:request.group,
			password:request.password
		},request.provider);
	}

	protected async _handleDeleteUser(
		request:PetQuerySchemaApiAuthUsersDeleteRequestType
	):Promise<PetQuerySchemaApiAuthUsersDeleteResponseType>{
		await this.getServer().getAuth().deleteUser(
			request.username,
			request.provider
		);
		return null;
	}

	protected _getProvider(req:PetQueryServerRequest):utf8_t|undefined{
		const args = req.getHandlerArgs();
		if('object' !== typeof args || null === args
		|| Array.isArray(args)){
			throw new Error('Invalid authentication arguments');
		}
		const provider = args.provider;
		if(undefined === provider){
			return undefined;
		}
		if('string' !== typeof provider || '' === provider){
			throw new Error('Authentication provider must be a nonempty string');
		}
		return provider;
	}

	protected async _handleProviderLogin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			const provider = this._getProvider(req);
			if(undefined === provider){
				throw new Error('Authentication provider is required');
			}
			const url = await this.getServer().getAuth().getLoginUrl(provider);
			res.redirectUrl(url.href);
		}
		catch(error){
			res.sendApiError(error);
		}
	}

	protected async _handleProviderCallback(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			const provider = this._getProvider(req);
			if(undefined === provider){
				throw new Error('Authentication provider is required');
			}
			const user = await this.getServer().getAuth().handleCallback(
				provider,
				req,
				res
			);
			const section = 'admin' === user.group ? 'config' : 'pets';
			res.redirectUrl(`/gui/admin/${section}`);
		}
		catch(error){
			res.sendApiError(error);
		}
	}
};
