/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaApiAuthMode = T.Union([
	T.Literal('bearer'),
	T.Literal('lmdb'),
	T.Literal('ldap'),
	T.Literal('oidc')
]);

export const PetQuerySchemaApiAuthProviderLogin = T.Union([
	T.Literal('bearer'),
	T.Literal('password'),
	T.Literal('redirect')
]);

export const PetQuerySchemaApiAuthGroup = T.Union([
	T.Literal('admin'),
	T.Literal('user')
]);

export const PetQuerySchemaApiAuthUser = T.Object({
	username:T.String(),
	displayName:T.String(),
	group:PetQuerySchemaApiAuthGroup,
	provider:T.String({minLength:1})
},{additionalProperties:false});

export const PetQuerySchemaApiAuthManagedUser = T.Object({
	...PetQuerySchemaApiAuthUser.properties,
	createdAt:T.String()
},{additionalProperties:false});

export type PetQuerySchemaApiAuthModeType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthMode>;
export type PetQuerySchemaApiAuthGroupType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthGroup>;
export type PetQuerySchemaApiAuthUserType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthUser>;
export type PetQuerySchemaApiAuthManagedUserType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthManagedUser>;
