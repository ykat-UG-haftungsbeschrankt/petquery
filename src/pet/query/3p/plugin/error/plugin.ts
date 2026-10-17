/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQuerySchemaPluginRequestType} from '#schema/plugin/request.js';
import {PetQuerySchemaPluginResponseType} from '#schema/plugin/response.js';
import {PetQuery3pPluginErrorConfig} from
	'#petquery/3p/plugin/error/config.js';

export class PetQuery3pPluginErrorPlugin extends PetQueryPlugin{
	constructor(cfg:PetQuery3pPluginErrorConfig){
		super('error',cfg);
	}
	override async query(UNUSED_query:PetQuerySchemaPluginRequestType):Promise<PetQuerySchemaPluginResponseType>{

		//throw new Error("1234");
		return new PetQuerySchemaPluginResponseType(
			true,
			[],
			new PetQueryResultData([])
		);
	}
};
