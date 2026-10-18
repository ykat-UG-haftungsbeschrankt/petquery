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
		this.getServer().get('/',this._redirectToGui.bind(this));
	}

	protected _redirectToGui(
		UNUSED_req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):void{
		res.redirect(302,'/gui');
	}
};
