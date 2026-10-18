/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryTypes } from '#petquery/types.js';

export class PetQueryAssert implements Singleton{
	private constructor(){}
	static notNull<T>(value:T|null|undefined):asserts value is NonNullable<T>{
		if(null === value || undefined === value){
			throw new Error('Value is null or undefined');
		}
	}
	static assertArray<T>(value:unknown):asserts value is Array<T>{
		if(!PetQueryTypes.isArray(value)){
			throw new Error('Value is not an array');
		}
	}
	static assertObject(value:unknown):asserts value is object{
		if(!PetQueryTypes.isObject(value)){
			throw new Error('Value is not an object');
		}
	}
	static assertInstanceOf<T extends object>(ctor:ConstructorType<T>,value:unknown):asserts value is T{
		if(!PetQueryTypes.isInstanceOf<T>(ctor,value)){
			throw new Error(`Value is not an instance of ${ctor.name}`);
		}
	}
};