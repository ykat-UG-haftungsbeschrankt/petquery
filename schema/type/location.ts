/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaTypeLocation = T.Object({
	latitude:T.Number({minimum:-90,maximum:90}),
	longitude:T.Number({minimum:-180,maximum:180})
},{additionalProperties:false});
