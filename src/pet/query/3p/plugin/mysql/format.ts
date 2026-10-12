/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryLibStringFormat} from '#petquery/lib/string/format.js';
import {
	escape,
	escapeId,
	type SqlValue
} from 'mysql2';

export class PetQuery3pPluginMysqlFormat extends PetQueryLibStringFormat{
	constructor(){
		super();

		this._delimiters = ['{','}'];
		this._escape = new Map([
			 ['default', (value:unknown)=>escape(String(value) as SqlValue)]
			,['id', (value:unknown)=>escapeId(String(value))]
		]);
	}
};
