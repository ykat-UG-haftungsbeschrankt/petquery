/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

export const PetQuerySchemaApiAuthApiClientPermission = T.Union([
	T.Literal('GET /api/ping/get'),
	T.Literal('GET /api/server/get'),
	T.Literal('PUT /api/server/put/:gid'),
	T.Literal('DELETE /api/server/delete/:gid'),
	T.Literal('GET /api/log/level/get'),
	T.Literal('GET /api/log/request/get'),
	T.Literal('GET /api/config/get'),
	T.Literal('PUT /api/config/put'),
	T.Literal('POST /api/pets/search'),
	T.Literal('POST /api/pets/:gid/sightings'),
	T.Literal('GET /api/pets'),
	T.Literal('POST /api/pets'),
	T.Literal('GET /api/pets/:gid'),
	T.Literal('PUT /api/pets/:gid'),
	T.Literal('DELETE /api/pets/:gid')
]);

export const PetQuerySchemaApiAuthApiClientPermissionWithWildcard =
	T.Union([
		T.Literal('*'),
		PetQuerySchemaApiAuthApiClientPermission
	]);

export const PetQuerySchemaApiAuthApiClientSettings = T.Object({
	name:T.String({minLength:1,maxLength:128}),
	allowedIps:T.Array(
		T.String({minLength:1,maxLength:64}),
		{minItems:1,maxItems:64,uniqueItems:true}
	),
	permissions:T.Array(
		PetQuerySchemaApiAuthApiClientPermissionWithWildcard,
		{minItems:1,maxItems:16,uniqueItems:true}
	)
},{additionalProperties:false});

export const PetQuerySchemaApiAuthApiClient = T.Object({
	...PetQuerySchemaApiAuthApiClientSettings.properties,
	id:T.String({format:'uuid'}),
	createdAt:T.String({format:'date-time'}),
	updatedAt:T.String({format:'date-time'})
},{additionalProperties:false});

export const PetQuerySchemaApiAuthApiClientPermissionCatalog:
	Array<{
		id:PetQuerySchemaStatic<
			typeof PetQuerySchemaApiAuthApiClientPermission
		>;
		label:utf8_t;
	}> = [
	{id:'GET /api/ping/get',label:'Read server status'},
	{id:'GET /api/server/get',label:'List known servers'},
	{id:'PUT /api/server/put/:gid',label:'Add or update a server'},
	{id:'DELETE /api/server/delete/:gid',label:'Remove a server'},
	{id:'GET /api/log/level/get',label:'Read application logs'},
	{id:'GET /api/log/request/get',label:'Read request logs'},
	{id:'GET /api/config/get',label:'Read server configuration'},
	{id:'PUT /api/config/put',label:'Update server configuration'},
	{id:'POST /api/pets/search',label:'Search pets'},
	{id:'POST /api/pets/:gid/sightings',label:'Report a pet sighting'},
	{id:'GET /api/pets',label:'List pets'},
	{id:'POST /api/pets',label:'Create a pet'},
	{id:'GET /api/pets/:gid',label:'Read a pet'},
	{id:'PUT /api/pets/:gid',label:'Update a pet'},
	{id:'DELETE /api/pets/:gid',label:'Delete a pet'}
];

export type PetQuerySchemaApiAuthApiClientPermissionType =
	PetQuerySchemaStatic<
		typeof PetQuerySchemaApiAuthApiClientPermission
	>;
export type PetQuerySchemaApiAuthApiClientPermissionWithWildcardType =
	PetQuerySchemaStatic<
		typeof PetQuerySchemaApiAuthApiClientPermissionWithWildcard
	>;
export type PetQuerySchemaApiAuthApiClientSettingsType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthApiClientSettings>;
export type PetQuerySchemaApiAuthApiClientType =
	PetQuerySchemaStatic<typeof PetQuerySchemaApiAuthApiClient>;
