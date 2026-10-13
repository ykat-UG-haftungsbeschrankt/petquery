/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {default as Express} from 'express';
import path from 'node:path';
import type {PetQueryServer} from '#petquery/server.js';
import {PetQueryServerRoute} from '#petquery/server/route.js';

// Serves the generated TypeDoc site at /docs.
export class PetQueryServerRouteDocs extends PetQueryServerRoute{
	protected readonly _root:filename_t;

	constructor(server:PetQueryServer){
		super(server);
		this._root = path.resolve('docs');
	}

	register():void{
		this.getServer().useExpress('/docs',Express.static(this._root,{
			index:'index.html'
		}));
	}
};
