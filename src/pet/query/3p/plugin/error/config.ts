/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPluginConfig} from '#petquery/plugin/config.js';

export class PetQuery3pPluginErrorConfig
	extends PetQueryPluginConfig{
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
	){
		super(baseCfg);
	}
};
