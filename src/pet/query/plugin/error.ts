/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';
import {PetQueryPluginErrorConfig} from '#petquery/plugin/error/config.js';

export class PetQueryPluginError extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginErrorConfig){
		super('error',cfg);
	}
	override async query(UNUSED_query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{

		//throw new Error("1234");
		return new PetQueryPluginResult([]);
	}
};
