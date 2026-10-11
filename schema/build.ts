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
import {PetQuerySchemaApiServerPutRequest} from
	'#schema/api/server/put/request.js';
import {PetQuerySchemaApiServerPutResponse} from
	'#schema/api/server/put/response.js';

const schemas:Array<[utf8_t,PetQuerySchemaType]> = [
	[
		'schema/api/server/put/request.json',
		PetQuerySchemaApiServerPutRequest.schema
	],
	[
		'schema/api/server/put/response.json',
		PetQuerySchemaApiServerPutResponse.schema
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
