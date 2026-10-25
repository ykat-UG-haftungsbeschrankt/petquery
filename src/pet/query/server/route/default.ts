/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryServerRoute } from '#petquery/server/route.js';

import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';

export class PetQueryServerRouteDefault extends PetQueryServerRoute{
	register():void{
		const config = this.getServer()._getConfig();
		if(true !== config.route['/'].enabled){
			return;
		}
		this.getServer().get('/',this._handleRoot.bind(this));
	}

	protected _handleRoot(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):void{
		if(true !== this.getServer()._getConfig().route.gui.enabled){
			res.status(404);
			res.end();
			return;
		}
		res.redirect(302,'/gui');
	}
};
