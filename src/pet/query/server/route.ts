/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import type {PetQueryServer} from '#petquery/server.js';

export abstract class PetQueryServerRoute{
	protected readonly _server:PetQueryServer;

	constructor(server:PetQueryServer){
		this._server = server;
	}

	abstract register(app:Express.Express):void;
};
