import { PetQueryTypes } from "./types.js";

export class PetQueryJson{
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
};