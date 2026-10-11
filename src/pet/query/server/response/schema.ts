/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Fields every API response has.
export type PetQueryServerResponseSchemaValues = {
	success:boolean;
	error:Array<utf8_t>;
};

// Base of all API responses: the HTTP status and the JSON values.
// Responses are built from typed values, so they are not validated again.
export abstract class PetQueryServerResponseSchema<
	T extends PetQueryServerResponseSchemaValues
>{
	protected _status:uint16_t;
	protected _values:T;

	constructor(status:uint16_t,values:T){
		this._status = status;
		this._values = values;
	}

	getStatus():uint16_t{
		return this._status;
	}

	getValues():T{
		return this._values;
	}

	toJson():T{
		return this._values;
	}

	destructor():void{
		try{
			// Holds no resources; present for the lifecycle convention.
		}
		catch(UNUSED_e){
		}
	}
};
