/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryPluginResultSource} from
	'#petquery/plugin/result/source.js';

export class PetQueryPluginConfig{
	private _enabled:boolean;
	private _timeout:milliseconds_t;
	private _source:PetQueryPluginResultSource;
	constructor(obj:{
		 enabled:boolean
		,timeout:milliseconds_t
		,source:PetQueryPluginResultSource
	}){
		this._enabled = obj.enabled;
		this._timeout = obj.timeout;
		this._source = obj.source;
	}
	isEnabled():boolean{
		return this._enabled !== false;
	}
	getTimeout():milliseconds_t{
		return this._timeout;
	}
	getSource():PetQueryPluginResultSource{
		return this._source;
	}
};
