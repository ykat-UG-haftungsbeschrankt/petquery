/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeLogLevel } from '#schema/type/log/level.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const schema = PetQuerySchema.type.Object({
	timestamp:PetQuerySchema.type.String({format:'date-time'}),
	level:PetQuerySchemaTypeLogLevel,
	message:PetQuerySchema.type.String()
},{
	additionalProperties:false
});

export const PetQuerySchemaTypeLogEntry = schema;

export type PetQuerySchemaTypeLogEntryType =
	PetQuerySchemaStatic<typeof schema>;
