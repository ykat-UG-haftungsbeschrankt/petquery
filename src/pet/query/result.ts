/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryJson} from '#petquery/json.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';

export class PetQueryResult{
	static readonly _parser = PetQueryCast.object({
		// Strict: PetQueryCast.boolean() treats any non-empty string as true.
		 success:PetQueryCast.values([true,false])
		// Keep error text as sent; string() trims by default.
		,error:PetQueryCast.array(PetQueryCast.string({trim:false}))
		,data:PetQueryCast.array(PetQueryJson.objectParser)
	});

	protected _success:boolean;
	protected _error:json_string_t[];
	protected _data:PetQueryPluginResult;
	constructor(
		success:boolean,
		error:json_string_t[],
		data:PetQueryPluginResult
	){
		this._success = success;
		this._error = error;
		this._data = data;
	}
	getError():json_string_t[]{
		return this._error;
	}
	getData():PetQueryPluginResult{
		return this._data;
	}
	toJson():json_t{
		return {
			success: this._success,
			error: this._error,
			data: this._data.toJson()
		};
	}
	static fromJson(json:unknown):PetQueryResult{
		const obj = PetQueryResult._parser.parse(json);
		return new PetQueryResult(
			obj.success,
			obj.error,
			PetQueryPluginResult.fromJson(obj.data)
		);
	}
};
