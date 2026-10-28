/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaTypeSource = T.Object({
	favicon:T.String(),
	url:T.String(),
	name:T.String(),
	apiEndpoint:T.Optional(T.String({format:'uri',maxLength:2048}))
},{additionalProperties:false});
