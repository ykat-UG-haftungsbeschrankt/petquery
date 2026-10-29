/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchemaApiAuthApiClientsDeleteRequest } from '#schema/api/auth/api-clients/delete/request.js';
import { PetQuerySchemaApiAuthApiClientsGetRequest } from '#schema/api/auth/api-clients/get/request.js';
import { PetQuerySchemaApiAuthApiClientsPostRequest } from '#schema/api/auth/api-clients/post/request.js';
import { PetQuerySchemaApiAuthApiClientsPutRequest } from '#schema/api/auth/api-clients/put/request.js';
import { PetQuerySchemaApiAuthApiClientsRotatePostRequest } from '#schema/api/auth/api-clients/rotate/post/request.js';
import { PetQuerySchemaApiAuthLoginPostRequest } from '#schema/api/auth/login/post/request.js';
import { PetQuerySchemaApiAuthLogoutPostRequest } from '#schema/api/auth/logout/post/request.js';
import { PetQuerySchemaApiAuthModeGetRequest } from '#schema/api/auth/mode/get/request.js';
import { PetQuerySchemaApiAuthOidcCallbackGetRequest } from '#schema/api/auth/oidc/callback/get/request.js';
import { PetQuerySchemaApiAuthOidcLoginGetRequest } from '#schema/api/auth/oidc/login/get/request.js';
import { PetQuerySchemaApiAuthSessionGetRequest } from '#schema/api/auth/session/get/request.js';
import { PetQuerySchemaApiAuthSetupPostRequest } from '#schema/api/auth/setup/post/request.js';
import { PetQuerySchemaApiAuthUsersDeleteRequest } from '#schema/api/auth/users/delete/request.js';
import { PetQuerySchemaApiAuthUsersGetRequest } from '#schema/api/auth/users/get/request.js';
import { PetQuerySchemaApiAuthUsersPostRequest } from '#schema/api/auth/users/post/request.js';
import { PetQuerySchemaApiAuthUsersPutRequest } from '#schema/api/auth/users/put/request.js';
import { PetQueryServerRoute } from '#petquery/server/route.js';
import { PetQueryServerRouteAccessGroup } from '#petquery/server/route.js';

import type { PetQuerySchemaApiAuthApiClientsDeleteRequestType } from '#schema/api/auth/api-clients/delete/request.js';
import type { PetQuerySchemaApiAuthApiClientsDeleteResponseType } from '#schema/api/auth/api-clients/delete/response.js';
import type { PetQuerySchemaApiAuthApiClientsGetRequestType } from '#schema/api/auth/api-clients/get/request.js';
import type { PetQuerySchemaApiAuthApiClientsGetResponseType } from '#schema/api/auth/api-clients/get/response.js';
import type { PetQuerySchemaApiAuthApiClientsPostRequestType } from '#schema/api/auth/api-clients/post/request.js';
import type { PetQuerySchemaApiAuthApiClientsPostResponseType } from '#schema/api/auth/api-clients/post/response.js';
import type { PetQuerySchemaApiAuthApiClientsPutRequestType } from '#schema/api/auth/api-clients/put/request.js';
import type { PetQuerySchemaApiAuthApiClientsPutResponseType } from '#schema/api/auth/api-clients/put/response.js';
import type { PetQuerySchemaApiAuthApiClientsRotatePostRequestType } from '#schema/api/auth/api-clients/rotate/post/request.js';
import type { PetQuerySchemaApiAuthApiClientsRotatePostResponseType } from '#schema/api/auth/api-clients/rotate/post/response.js';
import type { PetQuerySchemaApiAuthLoginPostRequestType } from '#schema/api/auth/login/post/request.js';
import type { PetQuerySchemaApiAuthLoginPostResponseType } from '#schema/api/auth/login/post/response.js';
import type { PetQuerySchemaApiAuthLogoutPostRequestType } from '#schema/api/auth/logout/post/request.js';
import type { PetQuerySchemaApiAuthLogoutPostResponseType } from '#schema/api/auth/logout/post/response.js';
import type { PetQuerySchemaApiAuthModeGetRequestType } from '#schema/api/auth/mode/get/request.js';
import type { PetQuerySchemaApiAuthModeGetResponseType } from '#schema/api/auth/mode/get/response.js';
import type { PetQuerySchemaApiAuthOidcCallbackGetRequestType } from '#schema/api/auth/oidc/callback/get/request.js';
import type { PetQuerySchemaApiAuthOidcCallbackGetResponseType } from '#schema/api/auth/oidc/callback/get/response.js';
import type { PetQuerySchemaApiAuthOidcLoginGetRequestType } from '#schema/api/auth/oidc/login/get/request.js';
import type { PetQuerySchemaApiAuthOidcLoginGetResponseType } from '#schema/api/auth/oidc/login/get/response.js';
import type { PetQuerySchemaApiAuthSessionGetRequestType } from '#schema/api/auth/session/get/request.js';
import type { PetQuerySchemaApiAuthSessionGetResponseType } from '#schema/api/auth/session/get/response.js';
import type { PetQuerySchemaApiAuthSetupPostRequestType } from '#schema/api/auth/setup/post/request.js';
import type { PetQuerySchemaApiAuthSetupPostResponseType } from '#schema/api/auth/setup/post/response.js';
import type { PetQuerySchemaApiAuthUsersDeleteRequestType } from '#schema/api/auth/users/delete/request.js';
import type { PetQuerySchemaApiAuthUsersDeleteResponseType } from '#schema/api/auth/users/delete/response.js';
import type { PetQuerySchemaApiAuthUsersGetRequestType } from '#schema/api/auth/users/get/request.js';
import type { PetQuerySchemaApiAuthUsersGetResponseType } from '#schema/api/auth/users/get/response.js';
import type { PetQuerySchemaApiAuthUsersPostRequestType } from '#schema/api/auth/users/post/request.js';
import type { PetQuerySchemaApiAuthUsersPostResponseType } from '#schema/api/auth/users/post/response.js';
import type { PetQuerySchemaApiAuthUsersPutRequestType } from '#schema/api/auth/users/put/request.js';
import type { PetQuerySchemaApiAuthUsersPutResponseType } from '#schema/api/auth/users/put/response.js';
import type { PetQueryServerNext } from '#petquery/server/route.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

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
			this._authenticateUser.bind(this),
			PetQuerySchemaApiAuthSessionGetRequest.getHandle(
				this._handleSession.bind(this)
			)
		);
		this.getServer().post(
			'/auth/setup',
			this._disableCache.bind(this),
			this._requireJsonContentType.bind(this),
			this._denyBearerLogin.bind(this),
			PetQuerySchemaApiAuthSetupPostRequest.getHandle(
				this._handleSetup.bind(this)
			)
		);
		this.getServer().post(
			'/auth/login',
			this._disableCache.bind(this),
			this._denyBearerLogin.bind(this),
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
			'/auth/api-clients',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthApiClientsGetRequest.getHandle(
				this._handleListApiClients.bind(this)
			)
		);
		this.getServer().post(
			'/auth/api-clients',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthApiClientsPostRequest.getHandle(
				this._handleCreateApiClient.bind(this)
			)
		);
		this.getServer().put(
			'/auth/api-clients/:id',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthApiClientsPutRequest.getHandle(
				this._handleUpdateApiClient.bind(this)
			)
		);
		this.getServer().post(
			'/auth/api-clients/:id/rotate',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthApiClientsRotatePostRequest.getHandle(
				this._handleRotateApiClientToken.bind(this)
			)
		);
		this.getServer().delete(
			'/auth/api-clients/:id',
			this._disableCache.bind(this),
			this._getAccessGroupHandler(PetQueryServerRouteAccessGroup.Admin),
			PetQuerySchemaApiAuthApiClientsDeleteRequest.getHandle(
				this._handleDeleteApiClient.bind(this)
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

	protected _denyBearerLogin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		const args:unknown = req.getHandlerArgs();
		const provider = 'object' === typeof args
			&& null !== args
			&& !Array.isArray(args)
			&& 'provider' in args
			? args.provider
			: undefined;
		const authorization = req.headers.authorization;
		let hasBearerHeader = false;
		if('string' === typeof authorization){
			const trimmedAuthorization = authorization.trim();
			const parts = trimmedAuthorization.split(/\s+/);
			const scheme = parts[0]?.toLowerCase();
			hasBearerHeader = 'bearer' === scheme;
		}
		if('bearer' === provider || hasBearerHeader){
			res.sendAuthForbiddenError(
				'Bearer tokens are for API clients, not admin login'
			);
			return;
		}
		next();
	}

	protected _requireJsonContentType(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		const header = req.headers['content-type'];
		if('string' !== typeof header){
			res.sendAuthForbiddenError('JSON content type required');
			return;
		}
		const parts = header.split(';',1);
		const value = parts[0];
		if(undefined === value){
			res.sendAuthForbiddenError('JSON content type required');
			return;
		}
		const trimmedValue = value.trim();
		const mediaType = trimmedValue.toLowerCase();
		if('application/json' !== mediaType){
			res.sendAuthForbiddenError('JSON content type required');
			return;
		}
		next();
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
		return {
			mode:auth.getMode(),
			setupRequired:await auth._isInitialSetupRequired(),
			providers:auth.getProviders()
		};
	}

	protected async _handleSession(
		UNUSED_request:PetQuerySchemaApiAuthSessionGetRequestType,
		req:PetQueryServerRequest
	):Promise<PetQuerySchemaApiAuthSessionGetResponseType>{
		const user = req.petQueryUser;
		if(undefined === user){
			throw new Error('Authenticated session user is missing');
		}
		return {user};
	}

	protected async _handleSetup(
		request:PetQuerySchemaApiAuthSetupPostRequestType,
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiAuthSetupPostResponseType>{
		const server = this.getServer();
		const auth = server.getAuth();
		await auth._createInitialAdmin(request,res);
		return null;
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
	):Promise<PetQuerySchemaApiAuthOidcLoginGetResponseType>{
		if(!this.getServer().getAuth().hasProvider('oidc')){
			res.sendAuthUnauthorizedError('OpenID Connect is not enabled');
			return null;
		}
		res.redirectUrl(
			(await this.getServer().getAuth().getOidcLoginUrl()).href
		);
		return null;
	}

	protected async _handleOidcCallback(
		UNUSED_request:PetQuerySchemaApiAuthOidcCallbackGetRequestType,
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<PetQuerySchemaApiAuthOidcCallbackGetResponseType>{
		const user = await this.getServer().getAuth().handleOidcCallback(
			req,
			res
		);
		const section = 'admin' === user.group ? 'config' : 'pets';
		res.redirectUrl(`/admin/${section}`);
		return null;
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

	protected async _handleListApiClients(
		UNUSED_request:PetQuerySchemaApiAuthApiClientsGetRequestType
	):Promise<PetQuerySchemaApiAuthApiClientsGetResponseType>{
		const server = this.getServer();
		const auth = server.getAuth();
		return auth._listApiClients();
	}

	protected async _handleCreateApiClient(
		request:PetQuerySchemaApiAuthApiClientsPostRequestType
	):Promise<PetQuerySchemaApiAuthApiClientsPostResponseType>{
		const server = this.getServer();
		const auth = server.getAuth();
		return auth._createApiClient(request);
	}

	protected async _handleUpdateApiClient(
		request:PetQuerySchemaApiAuthApiClientsPutRequestType
	):Promise<PetQuerySchemaApiAuthApiClientsPutResponseType>{
		const {id,...values} = request;
		const server = this.getServer();
		const auth = server.getAuth();
		return auth._updateApiClient(id,values);
	}

	protected async _handleRotateApiClientToken(
		request:PetQuerySchemaApiAuthApiClientsRotatePostRequestType
	):Promise<PetQuerySchemaApiAuthApiClientsRotatePostResponseType>{
		const server = this.getServer();
		const auth = server.getAuth();
		return auth._rotateApiClientToken(request.id);
	}

	protected async _handleDeleteApiClient(
		request:PetQuerySchemaApiAuthApiClientsDeleteRequestType
	):Promise<PetQuerySchemaApiAuthApiClientsDeleteResponseType>{
		const server = this.getServer();
		const auth = server.getAuth();
		await auth._deleteApiClient(request.id);
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
			res.redirectUrl(`/admin/${section}`);
		}
		catch(error){
			res.sendApiError(error);
		}
	}
};
