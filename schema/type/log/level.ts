/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryLogLevel } from '#petquery/log/level.js';
import { PetQuerySchema } from '#petquery/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
const schema = T.Union([
	T.Literal(PetQueryLogLevel.Error),
	T.Literal(PetQueryLogLevel.Warn),
	T.Literal(PetQueryLogLevel.Info),
	T.Literal(PetQueryLogLevel.Debug)
]);

export const PetQuerySchemaTypeLogLevel = schema;

export type PetQuerySchemaTypeLogLevelType =
	PetQuerySchemaStatic<typeof schema>;
