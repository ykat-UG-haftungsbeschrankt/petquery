/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryTypes } from '#petquery/types.js';

export class PetQueryJson implements Singleton{
	private constructor(){}
	static assertArray(value:unknown):asserts value is json_array_t{
		if(!PetQueryTypes.isArray(value)){
			throw new Error('Value is not an array');
		}
	}
	static assertObject(value:unknown):asserts value is json_object_t{
		if(!PetQueryTypes.isObject(value)){
			throw new Error('Value is not an object');
		}
	}
	static assertString(value:unknown):asserts value is string{
		if(!PetQueryTypes.isString(value)){
			throw new Error('Value is not a string');
		}
	}
	static isArray(value:unknown):value is json_array_t{
		return PetQueryTypes.isArray(value);
	}
	static isObject(value:unknown):value is json_object_t{
		return PetQueryTypes.isObject(value);
	}
	static isString(value:unknown):value is json_string_t{
		return PetQueryTypes.isString(value);
	}
	static isNumber(value:unknown):value is json_number_t{
		return PetQueryTypes.isNumber(value);
	}
	static isBoolean(value:unknown):value is json_boolean_t{
		return PetQueryTypes.isBoolean(value);
	}
	static isNull(value:unknown):value is json_null_t{
		return value === null;
	}
	static match(obj:json_t,pattern:RegExp){
		if(PetQueryJson.isArray(obj)){
			for(const item of obj){
				if(PetQueryJson.match(item,pattern)){
					return true;
				}
			}
		}else if(PetQueryJson.isObject(obj)){
			for(const item of Object.values(obj)){
				if(PetQueryJson.match(item,pattern)){
					return true;
				}
			}
		}else if(PetQueryJson.isString(obj)){
			return pattern.test(obj);
		}else if(PetQueryJson.isNumber(obj)
		|| PetQueryJson.isBoolean(obj)
		|| PetQueryJson.isNull(obj)){
			return pattern.test(String(obj));
		}else{
			throw new Error('Unknown JSON type');
		}
	}
};