/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';
import {PetQueryPluginTestConfig} from '#petquery/plugin/test/config.js';

export class PetQueryPluginTest extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginTestConfig){
		super('test',cfg);
	}
	override async query(
		UNUSED_query:PetQueryPluginQuery
	):Promise<PetQueryPluginResult>{
		return PetQueryPluginResult.fromJson([{
			source: {
				favicon: 'https://animalid.by/favicon.ico'
				, url: 'https://animalid.by'
				, name: 'Animalid'
			}
			,preview: ''
			,files: []
			,attributes: {
				name: {
					first: "Bob",
					last: "Smith",
				}
			}
		}]);
	}
};
