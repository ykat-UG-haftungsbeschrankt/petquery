/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQuerySchemaSearchRequest} from '#schema/search/request.js';

export class PetQueryServerRouteJson extends PetQueryServerRoute{
	register():void{
		const config = this.getServer()._getConfig().route.json;
		if(true !== config.enabled){
			return;
		}

		this.getServer().all(
			'/json',
			PetQuerySchemaSearchRequest._handle.bind(
				this,
				this._handleSearch.bind(this,null)
			)
		);
	}
};
