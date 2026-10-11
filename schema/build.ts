/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Writes each schema next to its source as JSON Schema, for clients that
// are not written in TypeScript. Run with `npm run build:schema` from the
// repository root; the .ts files are the source of truth.

import fs from 'node:fs/promises';
import type {PetQuerySchemaType} from '#petquery/schema.js';
import {PetQuerySchemaApiPingGetRequest} from
	'#schema/api/ping/get/request.js';
import {PetQuerySchemaApiPingGetResponse} from
	'#schema/api/ping/get/response.js';
import {PetQuerySchemaApiServerGetRequest} from
	'#schema/api/server/get/request.js';
import {PetQuerySchemaApiServerGetResponse} from
	'#schema/api/server/get/response.js';
import {PetQuerySchemaApiServerPutRequest} from
	'#schema/api/server/put/request.js';
import {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';
import {PetQuerySchemaApiServerDeleteRequest} from
	'#schema/api/server/delete/request.js';
import {PetQuerySchemaApiServerDeleteResponse} from
	'#schema/api/server/delete/response.js';
import {PetQuerySchemaApiConfigGetRequest} from
	'#schema/api/config/get/request.js';
import {PetQuerySchemaApiConfigGetResponse} from
	'#schema/api/config/get/response.js';
import {PetQuerySchemaApiConfigPutRequest} from
	'#schema/api/config/put/request.js';
import {PetQuerySchemaApiConfigPutResponse} from
	'#schema/api/config/put/response.js';
import {PetQuerySchemaSearchRequest} from
	'#schema/search/request.js';
import {PetQuerySchemaSearchResponse} from
	'#schema/search/response.js';
import {PetQueryServerResponseSchemaError} from
	'#petquery/server/response/schema/error.js';

// Error responses of every route are described by schema/error.json.
const schemas:Array<[utf8_t,PetQuerySchemaType]> = [
	[
		'schema/api/ping/get/request.json',
		PetQuerySchemaApiPingGetRequest.schema
	],
	[
		'schema/api/ping/get/response.json',
		PetQuerySchemaApiPingGetResponse.schema
	],
	[
		'schema/api/server/get/request.json',
		PetQuerySchemaApiServerGetRequest.schema
	],
	[
		'schema/api/server/get/response.json',
		PetQuerySchemaApiServerGetResponse.schema
	],
	[
		'schema/api/server/put/request.json',
		PetQuerySchemaApiServerPutRequest.schema
	],
	[
		'schema/api/server/put/response.json',
		PetQuerySchemaApiServerPutResponse.schema
	],
	[
		'schema/api/server/delete/request.json',
		PetQuerySchemaApiServerDeleteRequest.schema
	],
	[
		'schema/api/server/delete/response.json',
		PetQuerySchemaApiServerDeleteResponse.schema
	],
	[
		'schema/api/config/get/request.json',
		PetQuerySchemaApiConfigGetRequest.schema
	],
	[
		'schema/api/config/get/response.json',
		PetQuerySchemaApiConfigGetResponse.schema
	],
	[
		'schema/api/config/put/request.json',
		PetQuerySchemaApiConfigPutRequest.schema
	],
	[
		'schema/api/config/put/response.json',
		PetQuerySchemaApiConfigPutResponse.schema
	],
	[
		'schema/search/request.json',
		PetQuerySchemaSearchRequest.schema
	],
	[
		'schema/search/response.json',
		PetQuerySchemaSearchResponse.schema
	],
	[
		'schema/error.json',
		PetQueryServerResponseSchemaError.schema
	]
];

for(const [file,schema] of schemas){
	await fs.writeFile(
		file,
		JSON.stringify(
			{$schema:'https://json-schema.org/draft/2020-12/schema',...schema},
			null,
			'\t'
		) + '\n'
	);
	console.log(`Wrote ${file}`);
}
