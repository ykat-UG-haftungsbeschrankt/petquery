/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryServerResponseSchema} from
	'#petquery/server/response/schema.js';
import type {PetQueryServerResponseSchemaValues} from
	'#petquery/server/response/schema.js';

// {success:false,error} response, valid for every response schema.
export class PetQueryServerResponseSchemaError
	extends PetQueryServerResponseSchema<
		PetQueryServerResponseSchemaValues
	>{
	constructor(status:uint16_t,error:Array<utf8_t>){
		super(status,{success:false,error});
	}
};
