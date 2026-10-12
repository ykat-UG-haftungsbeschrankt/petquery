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
import {PetQuery3pPluginTestConfig} from
	'#petquery/3p/plugin/test/config.js';

export class PetQuery3pPluginTestPlugin extends PetQueryPlugin{
	constructor(cfg:PetQuery3pPluginTestConfig){
		super('test',cfg);
	}
	override async query(
		UNUSED_query:PetQueryPluginQuery
	):Promise<PetQueryResult>{
		return new PetQueryResult(true,[],PetQueryResultData.fromJson([{
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
		}]));
	}
};
