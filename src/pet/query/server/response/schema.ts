/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

import type { PetQuerySchemaCheck } from '#petquery/schema.js';
import type { PetQuerySchemaType } from '#petquery/schema.js';

export abstract class PetQueryServerResponseSchema<
	T_RESPONSE
>{
	abstract getSchema():PetQuerySchemaType;
	abstract getValidator():PetQuerySchemaCheck<T_RESPONSE>;

	fromJson(
		json:json_t
	):T_RESPONSE{
		return PetQuerySchema.parse<
			T_RESPONSE
		>(this.getValidator(),json);
	}

	toJson(
		params:T_RESPONSE
	){
		return params as json_t;
	}
};