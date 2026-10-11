/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryJson} from '#petquery/json.js';
import {PetQueryPluginResultEntry} from '#petquery/plugin/result/entry.js';

export class PetQueryPluginResult{
	protected _data;
	constructor(data:PetQueryPluginResultEntry[]){
		this._data = data;
	}
	getData(){
		return this._data;
	}
	toJson(){
		const ret:json_array_t = [];
		for(const item of this._data){
			ret.push(item.toJson());
		}
		return ret;
	}
	static fromJson(json:unknown):PetQueryPluginResult{
		const results:PetQueryPluginResultEntry[] = [];
		const items = PetQueryCast.array(
			PetQueryJson.objectParser
		).parse(json);

		for(const item of items){
			results.push(PetQueryPluginResultEntry.fromJson(item));
		}

		return new PetQueryPluginResult(results);
	}
};
