/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryTypes } from "./types.js";
import { PetQueryCast } from "./cast.js";

export class PetQueryJson{
	// PetQueryCast.object() strips unknown keys; this keeps arbitrary keys.
	static readonly objectParser:PetQueryCast.Parser<json_object_t> = {
		 type:'json_object_t'
		,sampleValue:{}
		,randomSample:PetQueryJson._sampleObject
		,parse:PetQueryJson._parseObject
	};

	protected static _sampleObject():json_object_t{
		return {};
	}
	protected static _parseObject(
		input:unknown,
		context:PetQueryCast.ParserContext = {}
	):json_object_t{
		if(!PetQueryTypes.isObject(input)){
			throw new PetQueryCast.InvalidInputError({
				 name:context.name
				,typePrefix:context.typePrefix
				,reasonSuffix:context.reasonSuffix
				,expectedType:'json_object_t'
				,reason:'got '+(
					null === input ? 'null'
					: PetQueryTypes.isArray(input) ? 'array'
					: typeof input
				)
			});
		}
		return input as json_object_t;
	}
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
	destructor():void{
	}
};