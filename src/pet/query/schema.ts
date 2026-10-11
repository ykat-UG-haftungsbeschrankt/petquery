/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import Type from 'typebox';
import Compile from 'typebox/compile';
import Format from 'typebox/format';
import Value from 'typebox/value';
import type {
	TLocalizedValidationError as PetQuerySchemaValidationError
} from 'typebox/error';

export type {
	Static as PetQuerySchemaStatic,
	TProperties as PetQuerySchemaProperties,
	TSchema as PetQuerySchemaType
} from 'typebox';
export type {Validator as PetQuerySchemaValidator} from 'typebox/compile';
export type {PetQuerySchemaValidationError};

// The part of a compiled validator that PetQuerySchema.parse() needs.
export type PetQuerySchemaCheck<T> = {
	Check(value:unknown):value is T;
	Errors(value:unknown):Array<PetQuerySchemaValidationError>;
};

// Single entry point to TypeBox, like PetQueryCast for cast.ts.
// Schemas are plain JSON Schema objects, so they can also be written to
// schema/*.json for peers that are not written in TypeScript.
export class PetQuerySchema{
	// Builders, for example PetQuerySchema.type.Object({...}).
	static readonly type = Type;
	// Compiles a schema into a validator whose Parse() returns the typed
	// value or throws, the safe cast for unknown data.
	static readonly compile = Compile;
	// Uncompiled checks and conversions, for example value.Check().
	static readonly value = Value;
	// String format registry (uuid, uri, email, ... are built in).
	static readonly format = Format;

	// Returns json typed as the validator's schema, or throws an Error
	// naming each invalid field. Use it instead of `json as Type`.
	static parse<T>(
		validator:PetQuerySchemaCheck<T>,
		json:unknown
	):T{
		if(!validator.Check(json)){
			throw new Error(
				PetQuerySchema.getErrorMessage(validator.Errors(json))
			);
		}
		return json;
	}

	// Joins validator errors into one message, for example
	// "/params/uuid must match format \"uuid\"".
	static getErrorMessage(
		errors:Array<PetQuerySchemaValidationError>
	):utf8_t{
		const ret:Array<utf8_t> = [];
		for(const error of errors){
			ret.push(`${error.instancePath || '/'} ${error.message}`);
		}
		return 0 === ret.length ? 'Invalid value' : ret.join('; ');
	}

	destructor():void{
		try{
			// Holds no resources; present for the lifecycle convention.
		}
		catch(UNUSED_e){
		}
	}
};
