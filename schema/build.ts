/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Writes each schema next to its source as JSON Schema, for clients that
// are not written in TypeScript. Run with `npm run build:schema` from the
// repository root; the .ts files are the source of truth.

import { PetQuerySchemaApiAuthLoginPostRequest } from '#schema/api/auth/login/post/request.js';
import { PetQuerySchemaApiAuthLoginPostResponse } from '#schema/api/auth/login/post/response.js';
import { PetQuerySchemaApiAuthLogoutPostRequest } from '#schema/api/auth/logout/post/request.js';
import { PetQuerySchemaApiAuthLogoutPostResponse } from '#schema/api/auth/logout/post/response.js';
import { PetQuerySchemaApiAuthModeGetRequest } from '#schema/api/auth/mode/get/request.js';
import { PetQuerySchemaApiAuthModeGetResponse } from '#schema/api/auth/mode/get/response.js';
import { PetQuerySchemaApiAuthOidcCallbackGetRequest } from '#schema/api/auth/oidc/callback/get/request.js';
import { PetQuerySchemaApiAuthOidcCallbackGetResponse } from '#schema/api/auth/oidc/callback/get/response.js';
import { PetQuerySchemaApiAuthOidcLoginGetRequest } from '#schema/api/auth/oidc/login/get/request.js';
import { PetQuerySchemaApiAuthOidcLoginGetResponse } from '#schema/api/auth/oidc/login/get/response.js';
import { PetQuerySchemaApiAuthSessionGetRequest } from '#schema/api/auth/session/get/request.js';
import { PetQuerySchemaApiAuthSessionGetResponse } from '#schema/api/auth/session/get/response.js';
import { PetQuerySchemaApiAuthUsersDeleteRequest } from '#schema/api/auth/users/delete/request.js';
import { PetQuerySchemaApiAuthUsersDeleteResponse } from '#schema/api/auth/users/delete/response.js';
import { PetQuerySchemaApiAuthUsersGetRequest } from '#schema/api/auth/users/get/request.js';
import { PetQuerySchemaApiAuthUsersGetResponse } from '#schema/api/auth/users/get/response.js';
import { PetQuerySchemaApiAuthUsersPostRequest } from '#schema/api/auth/users/post/request.js';
import { PetQuerySchemaApiAuthUsersPostResponse } from '#schema/api/auth/users/post/response.js';
import { PetQuerySchemaApiAuthUsersPutRequest } from '#schema/api/auth/users/put/request.js';
import { PetQuerySchemaApiAuthUsersPutResponse } from '#schema/api/auth/users/put/response.js';
import { PetQuerySchemaApiConfigGetRequest } from '#schema/api/config/get/request.js';
import { PetQuerySchemaApiConfigGetResponse } from '#schema/api/config/get/response.js';
import { PetQuerySchemaApiConfigPutRequest } from '#schema/api/config/put/request.js';
import { PetQuerySchemaApiConfigPutResponse } from '#schema/api/config/put/response.js';
import { PetQuerySchemaApiPetDeleteRequest } from '#schema/api/pet/delete/request.js';
import { PetQuerySchemaApiPetDeleteResponse } from '#schema/api/pet/delete/response.js';
import { PetQuerySchemaApiPetGetEntryRequest } from '#schema/api/pet/get/entry/request.js';
import { PetQuerySchemaApiPetGetEntryResponse } from '#schema/api/pet/get/entry/response.js';
import { PetQuerySchemaApiPetGetRequest } from '#schema/api/pet/get/request.js';
import { PetQuerySchemaApiPetGetResponse } from '#schema/api/pet/get/response.js';
import { PetQuerySchemaApiPetPostRequest } from '#schema/api/pet/post/request.js';
import { PetQuerySchemaApiPetPostResponse } from '#schema/api/pet/post/response.js';
import { PetQuerySchemaApiPetPutRequest } from '#schema/api/pet/put/request.js';
import { PetQuerySchemaApiPetPutResponse } from '#schema/api/pet/put/response.js';
import { PetQuerySchemaApiPetSearchRequest } from '#schema/api/pet/search/request.js';
import { PetQuerySchemaApiPingGetRequest } from '#schema/api/ping/get/request.js';
import { PetQuerySchemaApiPingGetResponse } from '#schema/api/ping/get/response.js';
import { PetQuerySchemaApiServerDeleteRequest } from '#schema/api/server/delete/request.js';
import { PetQuerySchemaApiServerDeleteResponse } from '#schema/api/server/delete/response.js';
import { PetQuerySchemaApiServerGetRequest } from '#schema/api/server/get/request.js';
import { PetQuerySchemaApiServerGetResponse } from '#schema/api/server/get/response.js';
import { PetQuerySchemaApiServerPutRequest } from '#schema/api/server/put/request.js';
import { PetQuerySchemaApiServerPutResponse } from '#schema/api/server/put/response.js';
import fs from 'node:fs/promises';

import type { PetQuerySchemaType } from '#petquery/schema.js';

// Error responses of every route are described by schema/error.json.
const schemas:Array<[utf8_t,PetQuerySchemaType]> = [
	[
		'schema/api/pet/search/request.json',
		PetQuerySchemaApiPetSearchRequest.getSchema()
	],
	[
		'schema/api/auth/mode/get/request.json',
		PetQuerySchemaApiAuthModeGetRequest.getSchema()
	],
	[
		'schema/api/auth/mode/get/response.json',
		PetQuerySchemaApiAuthModeGetResponse.getSchema()
	],
	[
		'schema/api/auth/session/get/request.json',
		PetQuerySchemaApiAuthSessionGetRequest.getSchema()
	],
	[
		'schema/api/auth/session/get/response.json',
		PetQuerySchemaApiAuthSessionGetResponse.getSchema()
	],
	[
		'schema/api/auth/login/post/request.json',
		PetQuerySchemaApiAuthLoginPostRequest.getSchema()
	],
	[
		'schema/api/auth/login/post/response.json',
		PetQuerySchemaApiAuthLoginPostResponse.getSchema()
	],
	[
		'schema/api/auth/logout/post/request.json',
		PetQuerySchemaApiAuthLogoutPostRequest.getSchema()
	],
	[
		'schema/api/auth/logout/post/response.json',
		PetQuerySchemaApiAuthLogoutPostResponse.getSchema()
	],
	[
		'schema/api/auth/oidc/login/get/request.json',
		PetQuerySchemaApiAuthOidcLoginGetRequest.getSchema()
	],
	[
		'schema/api/auth/oidc/login/get/response.json',
		PetQuerySchemaApiAuthOidcLoginGetResponse.getSchema()
	],
	[
		'schema/api/auth/oidc/callback/get/request.json',
		PetQuerySchemaApiAuthOidcCallbackGetRequest.getSchema()
	],
	[
		'schema/api/auth/oidc/callback/get/response.json',
		PetQuerySchemaApiAuthOidcCallbackGetResponse.getSchema()
	],
	[
		'schema/api/auth/users/get/request.json',
		PetQuerySchemaApiAuthUsersGetRequest.getSchema()
	],
	[
		'schema/api/auth/users/get/response.json',
		PetQuerySchemaApiAuthUsersGetResponse.getSchema()
	],
	[
		'schema/api/auth/users/post/request.json',
		PetQuerySchemaApiAuthUsersPostRequest.getSchema()
	],
	[
		'schema/api/auth/users/post/response.json',
		PetQuerySchemaApiAuthUsersPostResponse.getSchema()
	],
	[
		'schema/api/auth/users/put/request.json',
		PetQuerySchemaApiAuthUsersPutRequest.getSchema()
	],
	[
		'schema/api/auth/users/put/response.json',
		PetQuerySchemaApiAuthUsersPutResponse.getSchema()
	],
	[
		'schema/api/auth/users/delete/request.json',
		PetQuerySchemaApiAuthUsersDeleteRequest.getSchema()
	],
	[
		'schema/api/auth/users/delete/response.json',
		PetQuerySchemaApiAuthUsersDeleteResponse.getSchema()
	],
	[
		'schema/api/ping/get/request.json',
		PetQuerySchemaApiPingGetRequest.getSchema()
	],
	[
		'schema/api/ping/get/response.json',
		PetQuerySchemaApiPingGetResponse.getSchema()
	],
	[
		'schema/api/server/get/request.json',
		PetQuerySchemaApiServerGetRequest.getSchema()
	],
	[
		'schema/api/server/get/response.json',
		PetQuerySchemaApiServerGetResponse.getSchema()
	],
	[
		'schema/api/server/put/request.json',
		PetQuerySchemaApiServerPutRequest.getSchema()
	],
	[
		'schema/api/server/put/response.json',
		PetQuerySchemaApiServerPutResponse.getSchema()
	],
	[
		'schema/api/server/delete/request.json',
		PetQuerySchemaApiServerDeleteRequest.getSchema()
	],
	[
		'schema/api/server/delete/response.json',
		PetQuerySchemaApiServerDeleteResponse.getSchema()
	],
	[
		'schema/api/config/get/request.json',
		PetQuerySchemaApiConfigGetRequest.getSchema()
	],
	[
		'schema/api/config/get/response.json',
		PetQuerySchemaApiConfigGetResponse.getSchema()
	],
	[
		'schema/api/config/put/request.json',
		PetQuerySchemaApiConfigPutRequest.getSchema()
	],
	[
		'schema/api/config/put/response.json',
		PetQuerySchemaApiConfigPutResponse.getSchema()
	],
	[
		'schema/api/pet/get/request.json',
		PetQuerySchemaApiPetGetRequest.getSchema()
	],
	[
		'schema/api/pet/get/response.json',
		PetQuerySchemaApiPetGetResponse.getSchema()
	],
	[
		'schema/api/pet/get/entry/request.json',
		PetQuerySchemaApiPetGetEntryRequest.getSchema()
	],
	[
		'schema/api/pet/get/entry/response.json',
		PetQuerySchemaApiPetGetEntryResponse.getSchema()
	],
	[
		'schema/api/pet/post/request.json',
		PetQuerySchemaApiPetPostRequest.getSchema()
	],
	[
		'schema/api/pet/post/response.json',
		PetQuerySchemaApiPetPostResponse.getSchema()
	],
	[
		'schema/api/pet/put/request.json',
		PetQuerySchemaApiPetPutRequest.getSchema()
	],
	[
		'schema/api/pet/put/response.json',
		PetQuerySchemaApiPetPutResponse.getSchema()
	],
	[
		'schema/api/pet/delete/request.json',
		PetQuerySchemaApiPetDeleteRequest.getSchema()
	],
	[
		'schema/api/pet/delete/response.json',
		PetQuerySchemaApiPetDeleteResponse.getSchema()
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
