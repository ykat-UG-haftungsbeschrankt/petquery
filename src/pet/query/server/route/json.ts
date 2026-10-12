/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQuerySchemaSearchRequest} from '#schema/search/request.js';

export class PetQueryServerRouteJson extends PetQueryServerRoute{
	register(app:Express.Express):void{
		const config = this._server._getConfig().route.json;
		if(true !== config.enabled){
			return;
		}

		app.all(
			'/json',
			this._server._authenticateUser.bind(this._server),
			PetQuerySchemaSearchRequest._handle.bind(
				this,
				this._handleSearch.bind(this,null)
			)
		);
	}
};
