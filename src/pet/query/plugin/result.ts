/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryJson} from '#petquery/json.js';
import {PetQueryResultDataEntry} from '#petquery/plugin/result/entry.js';

export class PetQueryResultData{
	protected _data;
	constructor(data:PetQueryResultDataEntry[]){
		this._data = data;
	}
	getData(){
		return this._data;
	}
	append(data:PetQueryResultData):void{
		this._data = this._data.concat(data.getData());
	}
	toJson(){
		const ret:json_array_t = [];
		for(const item of this._data){
			ret.push(item.toJson());
		}
		return ret;
	}
	static fromJson(json:unknown):PetQueryResultData{
		const results:PetQueryResultDataEntry[] = [];
		const items = PetQueryCast.array(
			PetQueryJson.objectParser
		).parse(json);

		for(const item of items){
			results.push(PetQueryResultDataEntry.fromJson(item));
		}

		return new PetQueryResultData(results);
	}
};
