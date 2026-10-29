/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

function isJson(value:unknown):value is json_t{
	if(null === value
	|| 'string' === typeof value
	|| 'boolean' === typeof value){
		return true;
	}
	if('number' === typeof value){
		return Number.isFinite(value);
	}
	if(Array.isArray(value)){
		return value.every(isJson);
	}
	if('object' === typeof value){
		return Object.values(value).every(isJson);
	}
	return false;
}

export function isJsonRecord(
	value:unknown
):value is Record<utf8_t,json_t>{
	return 'object' === typeof value
		&& null !== value
		&& !Array.isArray(value)
		&& Object.values(value).every(isJson);
}
