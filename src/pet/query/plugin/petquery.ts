/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryResult} from '#petquery/result.js';
import {PetQueryPluginPetqueryConfig} from
	'#petquery/plugin/petquery/config.js';

export class PetQueryPluginPetquery extends PetQueryPlugin{
	protected _cfg:PetQueryPluginPetqueryConfig;
	constructor(cfg:PetQueryPluginPetqueryConfig){
		super('petquery',cfg);
		this._cfg = cfg;
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryResult>{
		const data = await fetch(this._cfg.getUri(),{
			headers:{
				...{
					 "accept-language": "en-US,en;q=0.9"
					,"cache-control": "max-age=0"
				}
				,...this._cfg.getHeaders()
				,...{
					 "accept": "application/json"
					,"content-type": "application/json"
				}
			}
			,body: JSON.stringify(query.toJson())
			,method: 'POST'
			,signal: AbortSignal.timeout(this.getTimeout())
		});
		if(!data.ok){
			throw new Error(data.statusText);
		}
		return PetQueryResult.fromJson(await data.json());
	}
};
