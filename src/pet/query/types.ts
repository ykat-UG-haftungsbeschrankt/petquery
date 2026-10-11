/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryTypes{
	static isArray(a:unknown):boolean{
		return (!!a) && (a.constructor === Array);
	}
	static isObject(a:unknown):boolean{
		return (!!a) && (a.constructor === Object);
	}
	static isString(a:unknown):boolean{
		return (!!a) && (a.constructor === String);
	}
	static isInstanceOf<T extends object>(
		constructor:ConstructorType<T>,
		obj:unknown
	):boolean{
		return null !== obj && obj instanceof constructor;
	}
	static isBoolean(a:unknown):boolean{
		return (typeof a === 'boolean');
	}
};