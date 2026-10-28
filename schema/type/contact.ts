/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaTypeContact = T.Object({
	name:T.String(),
	email:T.String({format:'email'}),
	phone:T.String()
},{additionalProperties:false});
