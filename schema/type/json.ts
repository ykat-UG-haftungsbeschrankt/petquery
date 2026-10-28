/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import Type from 'typebox';

const T = Type;
const schemaId = 'PetQuerySchemaJson';

// PetQuerySchema imports this shared schema, so avoid a circular import.
export const PetQuerySchemaTypeJson = T.Union([
	T.Null(),
	T.Boolean(),
	T.Number(),
	T.String(),
	T.Array(T.Ref(schemaId)),
	T.Record(T.String(),T.Ref(schemaId))
],{$id:schemaId});

export type PetQuerySchemaTypeJsonType = json_t;
