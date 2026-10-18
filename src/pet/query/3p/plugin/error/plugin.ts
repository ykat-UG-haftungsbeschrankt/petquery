/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin, PetQueryPluginConfig} from '#petquery/plugin.js';
import {PetQuerySchemaPluginRequestType} from '#schema/plugin/request.js';
import {PetQuerySchemaPluginResponseType} from '#schema/plugin/response.js';

export class PetQuery3pPluginErrorPlugin extends PetQueryPlugin{
	constructor(cfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]){
		super('error',cfg);
	}
	override async query(UNUSED_query:PetQuerySchemaPluginRequestType):Promise<PetQuerySchemaPluginResponseType>{

		//throw new Error("1234");
		return [];
	}
};
