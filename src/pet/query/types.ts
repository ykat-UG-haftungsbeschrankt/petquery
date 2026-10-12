/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryTypes{
	static isArray(value:unknown):value is unknown[]{
		return Array.isArray(value);
	}
	static isObject(value:unknown):value is object{
		return null !== value
		&& 'object' === typeof value
		&& Object.prototype === Object.getPrototypeOf(value);
	}
	static isString(value:unknown):value is string{
		return 'string' === typeof value;
	}
	static isInstanceOf<T extends object>(
		ctor:ConstructorType<T>,
		value:unknown
	):value is T{
		return value instanceof ctor;
	}
	static isBoolean(value:unknown):value is boolean{
		return 'boolean' === typeof value;
	}
	destructor():void{
	}
};