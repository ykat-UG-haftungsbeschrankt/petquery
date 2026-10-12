/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {default as Express} from 'express';
import path from 'node:path';
import type {ServerResponse} from 'node:http';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import type {PetQueryServer} from '#petquery/server.js';
import {_isNodeErrorCode} from '#petquery/server/config.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

// Serves the React admin GUI built from gui/ at /admin. Pages are public;
// the GUI sends a bearer token to the authenticated API routes.
export class PetQueryServerRouteAdmin extends PetQueryServerRoute{
	protected readonly _root:filename_t;

	constructor(server:PetQueryServer){
		super(server);
		this._root = path.resolve(server._getConfig().route.admin.path);
	}

	register(app:Express.Express):void{
		if(true !== this._server._getConfig().route.admin.enabled){
			return;
		}
		app.use('/admin',this._setSecurityHeaders.bind(this));
		app.use('/admin',this._authorizePage.bind(this));
		app.use('/admin',Express.static(this._root,{
			index:false,
			setHeaders:this._setStaticHeaders.bind(this)
		}));
		app.get(
			['/admin','/admin/{*path}'],
			this._handleIndex.bind(this)
		);
	}

	override destructor():void{
	}

	protected _setSecurityHeaders(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):void{
		res.setHeader('content-security-policy',[
			"default-src 'self'",
			"base-uri 'none'",
			"form-action 'self'",
			"frame-ancestors 'none'",
			"object-src 'none'"
		].join('; '));
		res.setHeader('x-content-type-options','nosniff');
		res.setHeader('referrer-policy','no-referrer');
		next();
	}

	// Build assets have content hashes in their names, so they never change.
	protected _setStaticHeaders(res:ServerResponse,file:filename_t):void{
		const assets = path.join(this._root,'assets') + path.sep;
		if(file.startsWith(assets)){
			res.setHeader(
				'cache-control',
				'public, max-age=31536000, immutable'
			);
		}
	}

	protected async _authorizePage(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		if('' !== path.extname(req.path)
		|| req.path.startsWith('/assets/')
		|| '/login' === req.path){
			next();
			return;
		}
		const section = this._getAdminSection(req.path);
		if(null === section || 'search' === section || 'docs' === section){
			next();
			return;
		}
		if('pets' === section){
			await this._server._authenticateUser(req,res,next);
			return;
		}
		await this._server._authenticateAdmin(req,res,next);
	}

	protected _getAdminSection(urlPath:utf8_t):utf8_t|null{
		const parts = urlPath.split('/').filter((part)=>{
			return '' !== part;
		});
		if(0 === parts.length){
			return null;
		}
		if('admin' === parts[0] && undefined !== parts[1]){
			return parts[1];
		}
		return parts[0];
	}

	// Serves index.html for client-side routes. A missing file with an
	// extension falls through to a 404 instead.
	protected _handleIndex(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):void{
		if('' !== path.extname(req.path)){
			next();
			return;
		}
		res.sendFile(
			'index.html',
			{root:this._root,headers:{'cache-control':'no-cache'}},
			this._onIndexSent.bind(this,res,next)
		);
	}

	protected _onIndexSent(
		res:PetQueryServerResponse,
		next:Express.NextFunction,
		error?:Error
	):void{
		if(undefined === error || null === error){
			return;
		}
		if(!res.headersSent
		&& _isNodeErrorCode(error,'ENOENT')){
			res.status(503);
			res.type('text/plain');
			res.send('Admin GUI is not built; run npm run build:gui');
			return;
		}
		next(error);
	}
};
