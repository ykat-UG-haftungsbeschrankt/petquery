/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import {PetQueryServerResponseSchema} from
	'#petquery/server/response/schema.js';
import type {PetQueryServerResponseSchemaValues} from
	'#petquery/server/response/schema.js';

const T = PetQuerySchema.type;

// {success:false,error} response, sent for invalid requests (400) and
// failed handlers (500) of every route.
export class PetQueryServerResponseSchemaError
	extends PetQueryServerResponseSchema<
		PetQueryServerResponseSchemaValues
	>{
	static readonly schema = T.Object({
		success:T.Literal(false),
		error:T.Array(T.String())
	},{
		title:'Error response of every route',
		additionalProperties:false
	});

	constructor(status:uint16_t,error:Array<utf8_t>){
		super(status,{success:false,error});
	}
};
