/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeContact } from '#schema/type/contact.js';
import { PetQuerySchemaTypeLocation } from '#schema/type/location.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaTypeLastSeen = T.Object({
	timestamp:T.String({format:'date-time'}),
	location:PetQuerySchemaTypeLocation,
	contact:PetQuerySchemaTypeContact
},{additionalProperties:false});
