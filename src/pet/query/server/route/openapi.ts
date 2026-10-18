/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryServerRoute } from '#petquery/server/route.js';
import { default as Express } from 'express';
import path from 'node:path';

import type { PetQueryServer } from '#petquery/server.js';
import type { PetQueryServerNext } from '#petquery/server/route.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

export class PetQueryServerRouteOpenapi extends PetQueryServerRoute{
	protected readonly _docsRoot:filename_t;

	constructor(server:PetQueryServer){
		super(server);
		this._docsRoot = path.resolve('openapi');
	}

	destructor():void{
		try{
		}
		catch(UNUSED_e){
		}
	}

	register():void{
		this.getServer().useExpress(
			'/openapi',
			Express.static(this._docsRoot,{index:'index.html'})
		);
		this.getServer().get(
			'/openapi/openapi.yaml',
			this._sendOpenApi.bind(this)
		);
	}

	protected _sendOpenApi(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		res.type('application/yaml');
		res.sendFile(
			'openapi.yaml',
			{root:this._docsRoot},
			this._onOpenApiSent.bind(this,next)
		);
	}

	protected _onOpenApiSent(
		next:PetQueryServerNext,
		error?:Error
	):void{
		if(undefined !== error && null !== error){
			next(error);
		}
	}
};
