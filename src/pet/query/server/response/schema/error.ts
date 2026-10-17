/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';

export type PetQueryServerResponseSchemaValues = {
	success:bool_t;
	error:Array<utf8_t>;
	data:json_t;
};

export class PetQueryServerResponseSchemaError{
	static readonly schema = PetQuerySchema.type.Object({
		success:PetQuerySchema.type.Literal(false),
		error:PetQuerySchema.type.Array(PetQuerySchema.type.String()),
		data:PetQuerySchema.type.Array(PetQuerySchema.type.Unknown())
	},{
		title:'Error response of every route',
		additionalProperties:false
	});

	protected readonly _status:uint16_t;
	protected readonly _values:PetQueryServerResponseSchemaValues;

	constructor(status:uint16_t,error:Array<utf8_t>){
		this._status = status;
		this._values = {
			success:false,
			error,
			data:[]
		};
	}

	getStatus():uint16_t{
		return this._status;
	}

	getValues():PetQueryServerResponseSchemaValues{
		return this._values;
	}

	toJson():PetQueryServerResponseSchemaValues{
		return this._values;
	}

	destructor():void{
		try{
		}
		catch(UNUSED_e){
		}
	}
};
