/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaTypeServer = T.Object({
	gid:T.String({format:'uuid'}),
	uri:T.String({format:'uri'}),
	adminContact:T.String({maxLength:1024}),
	companyAddress:T.String({maxLength:4096}),
	pingTimeMs:T.Integer({minimum:-1}),
	addedAt:T.String({format:'date-time'}),
	updatedAt:T.String({format:'date-time'}),
	lastPingAt:T.String({format:'date-time'})
},{additionalProperties:false});
