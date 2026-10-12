/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryResultData} from '#petquery/result/data.js';
import {PetQueryResult} from '#petquery/result.js';
import {PetQuery3pPluginErrorConfig} from
	'#petquery/3p/plugin/error/config.js';

export class PetQuery3pPluginErrorPlugin extends PetQueryPlugin{
	constructor(cfg:PetQuery3pPluginErrorConfig){
		super('error',cfg);
	}
	override async query(UNUSED_query:PetQueryPluginQuery):Promise<PetQueryResult>{

		//throw new Error("1234");
		return new PetQueryResult(
			true,
			[],
			new PetQueryResultData([])
		);
	}
};
