<div align="center">

# 🐾 petquery

**One search. Every registry. Bring lost pets home — across borders.**

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ykat-UG-haftungsbeschrankt/petquery)](https://github.com/ykat-UG-haftungsbeschrankt/petquery/releases)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)

[Website](https://petquery.org) ·
[Repository](https://github.com/ykat-UG-haftungsbeschrankt/petquery) ·
[API docs](#-documentation)

</div>

---

## Index

- [Why petquery?](#-why-petquery)
- [Features](#-features)
- [How it works](#-how-it-works)
- [Quick start](#-quick-start)
- [Configuration](#-configuration)
- [GUI and API server split](#gui-and-api-server-split)
  - [First-time bootstrap](#first-time-bootstrap)
  - [Production](#production)
- [Endpoints](#-endpoints)
  - [API schemas](#api-schemas)
  - [Pet search](#post-apipetssearch-search-pets-and-registries)
  - [Peer registration](#federation-register-a-peer)
  - [Server index](#apiserver-manage-the-server-index)
  - [Configuration API](#apiconfig-read-and-save-configuration)
  - [Authentication](#auth-sessions-and-user-management)
- [Plugins](#-plugins)
- [Persistent server index](#persistent-server-index)
- [Development](#-development)
  - [Schemas](#schemas)
  - [Admin GUI](#admin-gui)
- [Documentation](#-documentation)
- [License](#-license)

## 💡 Why petquery?

When a pet goes missing, most national authorities only search the national
and local registries that hold owner information. A pet that travelled with
its owner, or wandered over a border, can end up in a database nobody thinks
to check.

**petquery** is a small, plugin-based **meta search engine** for pet
microchip IDs. You enter one query, it asks every configured registry at the
same time, and it returns a single combined result.

## ✨ Features

- 🔌 **Plugin-based**: every data source is a plugin. Use the built-in ones or
  write your own in a few lines.
- ⚡ **Parallel queries**: all plugins are queried at the same time. One slow
  or failing source never blocks the others.
- 🌍 **Federated**: petquery servers can query *each other*, so authorities
  can share their local data without sharing their database.
- 🔁 **Loop-safe**: each server has its own `gid`, and queries carry a
  traceroute of the servers they have passed through, so loops between
  federated servers can be spotted.
- 🛡️ **Validated I/O**: incoming and remote JSON is checked with
  [`cast.ts`](https://www.npmjs.com/package/cast.ts) before it is used.
- 🔐 **Machine API clients**: managed bearer credentials for
  machine-to-machine access.
- 📷 **Image search**: uploaded pet photos can be matched against local
  records with the built-in AI search index.
- 📎 **File uploads**: photos or documents can also be passed to plugins.

## 🧭 How it works

```mermaid
flowchart LR
    U([🧑 User / Authority]) -->|chip ID or photo| S[🐾 petquery server]
    S --> A[animalid.by]
    S --> M[(MySQL)]
    S --> D[(MongoDB)]
    S --> I[(Local AI image search)]
    S --> P[🐾 another petquery server]
    A & M & D & I & P -->|results| S
    S -->|merged result| U
```

## 🚀 Quick start

```bash
git clone https://github.com/ykat-UG-haftungsbeschrankt/petquery.git
cd petquery
npm install
npm run install:gui
```

In one terminal, start three isolated API servers:

```bash
npm run debug:multi
```

The script builds the server and GUI, asks for an admin username and password,
starts servers on ports `50101`, `50102` and `50103`, and registers them as
peers. It creates temporary API clients for peer registration and revokes
them when stopped. Press Ctrl+C to stop the servers.

In another terminal, start the GUI:

```bash
npm run dev:gui
```

Open the URL Vite prints, normally `http://127.0.0.1:5173/`. If
`gui/.env.local` is missing, the GUI asks for the API server origin; for
`debug:multi`, use `http://127.0.0.1:50101`.

To start one server from its own JSON config, build the server and GUI, then
run:

```bash
npm run build:server
npm run build:gui
node dist/index.js --config path/to/server.json --port 50101
```

`PetQueryArgs` parses `--config` and `--port` with
[`command-line-args`](https://github.com/75lb/command-line-args). A positional
config path is also accepted:

```bash
node dist/index.js path/to/server.json --port 50101
```

`--port` is required. If the config file exists, the server listens on the
port in `http.port`; if it does not exist, the server starts the local
bootstrap listener on `--port`.

> [!TIP]
> The ready-to-run multi-server configs are in [`config/debug/`](config/debug).
> `var/debug/` holds each server's separate LMDB files, AI-search SQLite index,
> and other per-server data.

## ⚙️ Configuration

The server loads a JSON config selected with `--config`. `PetQueryArgs`
parses `--config` and `--port`; a positional config path is also accepted.
The strict schema is defined in
[`schema/server/database/config/entry.ts`](schema/server/database/config/entry.ts).
Every property is required. [`server-a.json`](config/debug/server-a.json) is a
complete LMDB example; `server-b.json` and `server-c.json` use separate ports
and storage paths.

Important fields:

| Field | Purpose |
|---|---|
| `api.endpoint` | This server's advertised API origin |
| `http` | Host, port, enabled flag and trusted proxies |
| `https` | Host, port, enabled flag and TLS certificate fields |
| `authenticate` | Login mode, providers, sessions and provider settings |
| `database` | Database backend and its connection or file path |
| `logging` | Log level, request logging and log file settings |
| `ai_search_path` | Per-server SQLite sidecar for image-search vectors |
| `index.sync` | Whether and how often to sync the peer index |
| `route.api` | Enables the API and selects the plugins it queries |

All config fields are required. Use empty values for settings that are
disabled, such as `https.certificate.key` and `cert` when HTTPS is off, and an
empty `http.trusted_proxies` array for direct connections. Static
`authenticate.bearer` and `authenticate.bearer_env` fields have been removed;
create machine credentials under Admin → API clients instead.

The debug database and AI-search data persist under `var/debug/`. Remove a
server's directory to reset its data and identity. Database, logging and
AI-search paths are resolved relative to the JSON config file.

Examples of database descriptors are:

```json
{"type": "lmdb", "path": "../../var/debug/server-a/lmdb"}
```

or:

```json
{
	"type": "postgresql",
	"connectionString": "postgresql://user:password@host/database"
}
```

Other supported backends are `mariadb` (`connectionString`), `mongodb`
(`connectionString` and `database`), `redis` (`connectionString`) and
`sqlite` (`path`).

The admin GUI can save runtime settings to the configured database. Those
saved settings are applied on restart and can override corresponding JSON
values.

## GUI and API server split

The Express API server and the React GUI are separate processes. The API
server exposes `/api/*` and `/auth/*`; it no longer serves the GUI, TypeDoc,
Swagger/OpenAPI, or a root redirect.

### Development

Run the API server/bootstrap listener and GUI in separate terminals. The
GUI is served by Vite from `/`, normally at `http://127.0.0.1:5173/`:

```bash
npm run dev:gui
```

When `PETQUERY_API_URL` is set in `gui/.env.local`, Vite proxies `/api`,
`/auth` and `/bootstrap` to that origin. If no endpoint is configured, the
GUI asks for the running API/bootstrap origin and saves it in
`gui/.env.local`. Restart Vite to apply the proxy target. This target is
distinct from `api.endpoint`, which is the origin the configured server
advertises to peers and clients.

### First-time bootstrap

Start the server with a config path that does not exist:

```bash
npm run build:server
node dist/index.js --config config/debug/bootstrap.json --port 50101
```

The VS Code **Bootstrap PetQuery** launch profile uses this ignored config
path. The bootstrap listener binds to `127.0.0.1` on the required `--port`.
In another terminal, run `npm run dev:gui`, open the Vite URL, and enter
`http://127.0.0.1:50101` if the GUI asks for an API origin. Save the endpoint,
restart Vite, and reload the GUI.

The GUI detects bootstrap mode through `GET /bootstrap` and displays a
structured config form. Submitting the form posts the complete
`PetQuerySchemaServerDatabaseConfigEntry` to `POST /bootstrap`. The server
validates and writes the config file, closes the bootstrap listener, then
starts the configured API server. The API endpoint is saved to
`gui/.env.local` for Vite's proxy. If it differs from the bootstrap origin,
restart Vite again so it uses the new target. The GUI then offers initial
administrator setup; the password is not stored in the config file.

Bootstrap mode is used only when the selected config file does not exist.
Otherwise the process starts the normal API server.

### Production

`npm run build:gui` builds the Vite app into `dist/gui/`. Serve that directory
from a static web server at `/`; the API server does not host it. Configure
the GUI host or a reverse proxy to send `/api/*` and `/auth/*` to the API
backend on the same origin. The production GUI expects an already-configured
API server; use the development GUI for first-time bootstrap. The bootstrap
listener binds to loopback and should not be exposed through a public proxy.
The GUI Docs page loads TypeDoc at `/typedoc/` and Swagger UI at `/openapi/`.

## 🌐 Endpoints

| Endpoint | Auth | Returns | Turned on by |
|---|:---:|---|---|
| `POST /api/pets/search` | — | Local pet and plugin matches | `route.api.enabled` |
| `/api/server/*` | varies | Read or manage the server index | `route.api.enabled` |
| `/api/config/*` | 🔐 admin | Read or save the editable config | `route.api.enabled` |
| `/api/pets` | 🔐 user/admin | Manage local pet JSON records | `route.api.enabled` |
| `/auth/*` | varies | Login, sessions and user management | — |
| `/bootstrap` | — | `GET` status; `POST` config | Bootstrap only |

The GUI host serves `/`, client-side routes, `/typedoc/` and `/openapi/`.
These are not routes on the API server.

`POST /api/pets/search` accepts JSON or form bodies and
`multipart/form-data` file uploads.

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | Text to search, such as a microchip number |
| `files` | `file[]` | Uploads used by plugins and local AI image search |
| `tracerouteUuid` | `uuid[]` | Servers the query has passed through (federation) |

### API schemas

Successful API responses use this envelope:

```json
{
	"success": true,
	"error": [],
	"data": {}
}
```

Validated request and response schemas are generated from the TypeScript
definitions. The complete schema index is:

| Endpoint | Request schema | Response schema |
|---|---|---|
| `GET /api/ping/get` | [`request.json`](schema/api/ping/get/request.json) | [`response.json`](schema/api/ping/get/response.json) |
| `GET /api/server/get` | [`request.json`](schema/api/server/get/request.json) | [`response.json`](schema/api/server/get/response.json) |
| `PUT /api/server/put/:gid` | [`request.json`](schema/api/server/put/request.json) | [`response.json`](schema/api/server/put/response.json) |
| `DELETE /api/server/delete/:gid` | [`request.json`](schema/api/server/delete/request.json) | [`response.json`](schema/api/server/delete/response.json) |
| `GET /api/config/get` | [`request.json`](schema/api/config/get/request.json) | [`response.json`](schema/api/config/get/response.json) |
| `PUT /api/config/put` | [`request.json`](schema/api/config/put/request.json) | [`response.json`](schema/api/config/put/response.json) |
| `POST /api/pets/search` | [`request.json`](schema/api/pet/search/request.json) | [`response.json`](schema/api/pet/search/response.json) |
| `GET /api/pets` | [`request.json`](schema/api/pet/get/request.json) | [`response.json`](schema/api/pet/get/response.json) |

The search request body is a JSON object:

```json
{
	"query": "112093400000465",
	"tracerouteUuid": []
}
```

For `POST /api/pets/search`, `query` is required while `files` and
`tracerouteUuid` are optional. Uploaded files can be sent as multipart form
fields or included in the JSON `files` array.

All generated schemas are also available as TypeScript sources under
[`schema/`](schema) and can be regenerated with `npm run build:schema`.

### `POST /api/pets/search`: search pets and registries

Use this to show petquery results on your own website or in your own
application.

<details open>
<summary><b>JavaScript</b></summary>

```js
const response = await fetch('https://petquery.org/api/pets/search', {
	method: 'POST',
	headers: {
		'accept': 'application/json',
		'content-type': 'application/json',
		'authorization': 'Bearer <your-token>'
	},
	body: JSON.stringify({query: '112093400000465'})
});
if(!response.ok){
	throw new Error(response.statusText);
}
console.log(await response.json());
```

</details>

<details>
<summary><b>PHP</b></summary>

```php
#!/usr/bin/php
<?php

$result = file_get_contents(
	'https://petquery.org/api/pets/search',
	false,
	stream_context_create([
		'http' => [
			'method'  => 'POST',
			'header'  => "Content-Type: application/json\r\n"
				. "Authorization: Bearer <your-token>",
			'content' => json_encode(['query' => '112093400000465'])
		]
	])
);

print_r(json_decode($result, true));
```

</details>

<details>
<summary><b>curl</b></summary>

```bash
curl -X POST https://petquery.org/api/pets/search \
	-H 'content-type: application/json' \
	-H 'authorization: Bearer <your-token>' \
	-d '{"query":"112093400000465"}'
```

</details>

Response:

```json
{
	"success": true,
	"error": [],
	"data": [
		{
			"source": {
				"favicon": "https://animalid.by/favicon.ico",
				"url": "https://animalid.by",
				"name": "Animalid"
			},
			"preview": "",
			"files": [],
			"gid": "550e8400-e29b-41d4-a716-446655440000",
			"name": "Bob",
			"species": "dog",
			"owner_contact": "owner@example.org",
			"notes": "",
			"attributes": [
				{"key": "microchip", "value": "112093400000465"}
			]
		}
	]
}
```

Partial plugin or local-search failures are included in the envelope's
`error` array while successful results are returned. Other handler failures
use the standard error envelope. The request and response are described in
[`schema/api/pet/search/`](schema/api/pet/search).

The GUI uses the same public `POST /api/pets/search` endpoint, so searches
do not require a GUI login.

### Federation: register a peer

Peer sync shares base URLs and server index entries, not the underlying pet
database. Register a peer with its `gid` and advertised base URI:

```js
const response = await fetch(
	'https://petquery.org/api/server/put/'
		+ '550e8400-e29b-41d4-a716-446655440000',
	{
		method: 'PUT',
		headers: {
			'content-type': 'application/json',
		'authorization': 'Bearer <your-token>'
		},
		body: JSON.stringify({uri: 'https://registry.example.org'})
	}
);
console.log(await response.json());
```

### `/api/server/*`: manage the server index

These routes manage the [persistent server index](#persistent-server-index).
`GET` routes are public so that peers can sync; `PUT` and `DELETE` require the
`admin` group. Each path names its HTTP method, and the request must use that
method.

| Method | Path | Body | Action |
|---|---|---|---|
| `GET` | `/api/ping/get` | — | Return this server's `gid` and base URI |
| `GET` | `/api/server/get` | — | List all servers |
| `PUT` | `/api/server/put/:gid` | `uri` (JSON or form) | Add or replace a server |
| `DELETE` | `/api/server/delete/:gid` | — | Delete a server |

Responses are JSON with `success` and `error`; the list also has `data`, an
array of `{gid, uri}` objects. An invalid UUID or a missing or non-absolute
URI returns `400`, and a database error returns `500`. Deleting a missing
UUID succeeds.

The request and response of `PUT /api/server/put/:gid` are described as
JSON Schema in [`schema/api/server/put/`](schema/api/server/put), see
[Schemas](#schemas).

```js
await fetch(
	'https://petquery.org/api/server/put/550e8400-e29b-41d4-a716-446655440000',
	{
		method: 'PUT',
		headers: {
			'content-type': 'application/json',
			'authorization': '******'
		},
		body: JSON.stringify({uri: 'https://registry.example.org/'})
	}
);
```

### `/api/config/*`: read and save configuration

These routes require the `admin` group. `GET /api/config/get` returns the
running configuration as `active`, the persisted configuration as `saved`,
and the recognized plugin names. A failure to read persisted configuration
is returned as a normal API error envelope.
`PUT /api/config/put` accepts the same configuration shape as `data.saved`.
The complete request and response definitions are in
[`schema/api/config/`](schema/api/config).

The `authenticate` configuration contains:

```json
{
	"mode": "lmdb",
	"providers": ["lmdb"],
	"plugin_options": {},
	"session": {
		"cookie_name": "petquery_session",
		"max_age": 28800000,
		"secure": false
	},
	"lmdb": {
		"users_name": "users",
		"sessions_name": "sessions"
	},
	"ldap": {
		"url": "ldaps://ldap.example.org",
		"bind_dn": "",
		"bind_password": "",
		"base_dn": "ou=people,dc=example,dc=org",
		"user_filter": "(uid={{username}})",
		"admin_group": "petquery-admin"
	},
	"oidc": {
		"issuer": "https://login.example.org",
		"client_id": "",
		"client_secret": "",
		"redirect_uri": "https://petquery.example.org/auth/oidc/callback",
		"scopes": "openid profile email groups",
		"admin_group": "petquery-admin"
	}
}
```

Select login providers in `authenticate.providers`. Static
`authenticate.bearer` and `authenticate.bearer_env` fields are no longer
supported. Create machine credentials in Admin → API clients instead.
Admin-saved settings can override JSON settings on restart.

### `/api/pets`: manage local pet records

Authenticated `admin` and `user` accounts can manage the local pet database.
Each record has this shape:

```json
{
	"gid": "550e8400-e29b-41d4-a716-446655440000",
	"name": "Bob",
	"species": "dog",
	"owner_contact": "owner@example.org",
	"notes": "Friendly and chipped.",
	"source": {"favicon": "", "url": "", "name": "Local"},
	"preview": "",
	"files": [],
	"attributes": [
		{"key": "microchip", "value": "112093400000465"}
	]
}
```

All fields are required. `preview` and `files` may contain URLs or
`data:image/...;base64,...` image data. The GUI can upload preview and
attachment images instead of requiring users to paste data URIs.

| Method | Path | Request body | Result |
|---|---|---|---|
| `GET` | `/api/pets` | — | All pet records |
| `POST` | `/api/pets` | Pet record | Create a record |
| `GET` | `/api/pets/:gid` | — | One pet record |
| `PUT` | `/api/pets/:gid` | Pet record | Replace a record |
| `DELETE` | `/api/pets/:gid` | — | Delete a record |

Successful responses use the common envelope. Invalid fields return `400`,
missing records return `404`, and authorization failures return `401` or
`403`.

### `/auth/*`: sessions and user management

`GET /auth/mode` is public and returns the selected provider:

```json
{
	"success": true,
	"error": [],
	"data": {"mode": "lmdb"}
}
```

`POST /auth/login` accepts a username and password for LMDB or LDAP:

```json
{
	"username": "alice",
	"password": "correct horse battery staple"
}
```

The server sets an HttpOnly session cookie and returns:

```json
{
	"success": true,
	"error": [],
	"data": {
		"user": {
			"username": "alice",
			"displayName": "Alice",
			"group": "admin",
			"provider": "lmdb"
		}
	}
}
```

For OIDC mode, open `GET /auth/oidc/login`; the callback creates the same
session and redirects to the appropriate Admin page. Machine-to-machine
bearer tokens are managed as API clients in the Admin GUI.

| Method | Path | Auth | Action |
|---|---|---|---|
| `GET` | `/auth/mode` | — | Read the selected provider |
| `GET` | `/auth/session` | Session | Read the current user |
| `POST` | `/auth/login` | Provider-specific | Create a session |
| `POST` | `/auth/logout` | Session | Revoke the session |
| `GET` | `/auth/oidc/login` | — | Start OIDC login |
| `GET` | `/auth/oidc/callback` | OIDC | Finish OIDC login |
| `GET` | `/auth/users` | Admin | List users or active external sessions |
| `POST` | `/auth/users` | Admin | Create an LMDB user |
| `PUT` | `/auth/users/:username` | Admin | Update an LMDB user |
| `DELETE` | `/auth/users/:username` | Admin | Delete an LMDB user |

Local users have `admin` or `user` groups. LDAP and OIDC users are
read-only in the Users tab; their group is determined by the configured
provider group mapping.

## 🔌 Plugins

| Plugin | Source |
|---|---|
| `animalid.by` | The [animalid.by](https://animalid.by) registry |
| `mysql` | Any MySQL / MariaDB table, using a configurable SQL template |
| `mongodb` | Any MongoDB collection, matched on `uid` |
| `petquery` | Another petquery server (federation) |
| `test` / `error` | Fixed sample data and error output, for development |

### Writing your own plugin

A plugin is a class that extends `PetQueryPlugin`. It receives the query and
returns a result:

```ts
import {PetQueryPlugin} from '#petquery/plugin.js';
import {PetQueryPluginQuery} from '#petquery/plugin/query.js';
import {PetQueryPluginResult} from '#petquery/plugin/result.js';
import {PetQueryPluginMyRegistryConfig} from
	'#petquery/plugin/my/registry/config.js';

export class PetQueryPluginMyRegistry extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginMyRegistryConfig){
		super('my-registry',cfg);
	}

	override async query(
		query:PetQueryPluginQuery
	):Promise<PetQueryPluginResult>{
		const rows = await lookUp(query.getQuery());
		return PetQueryPluginResult.fromJson(rows.map((row)=>{
			return {
				source:this.getSource().toJson(),
				preview:'',
				files:[],
				attributes:row
			};
		}));
	}
};
```

Register the plugin in `index.ts`, and list `my-registry` under
`route.api.plugins` in the server JSON config. Plugin-specific settings are
provided by the application code:

```ts
const pluginConfig = loadMyRegistryConfig();
server.addPlugin(new PetQueryPluginMyRegistry(pluginConfig));
```

## Persistent server index

The server stores its own `gid` and peer `{gid, uri}` entries in its configured
database. The `uri` is the peer's advertised base URL. A server generates its
identity on first start and retains it across restarts as long as the same
database is used.

For independent servers, configure a separate database directory or
PostgreSQL database for each instance. Reusing a database intentionally makes
instances share their identity and saved runtime configuration. Also give
each server a separate `ai_search_path`; the debug configs demonstrate this
layout.

The index routes are documented in [`/api/server/*`](#apiserver-manage-the-server-index).
The server closes its owned database resources on `SIGINT` or `SIGTERM`.

### Peer sync

When `index.sync.enabled` is on, `PetQueryServerIndexSync` syncs the
index at startup and then every `sync.interval` after the previous run ends.
For each known server, it fetches `GET <uri>/api/server/get` and merges the
returned entries:

- Entries with this server's own UUID, and entries already known with the
  same URI, are skipped.
- Other entries must use `http` or `https`. Each is added, or replaces the
  known URI, only if `GET <uri>/api/ping/get` answers with the same UUID.
- Unreachable servers and rejected entries are logged and skipped; nothing
  is deleted.

The URI of a server is its base URL; `api/...` is resolved under its path.
Requests time out after `sync.timeout`, do not follow redirects, and read at
most `sync.max_servers` entries per peer. Peers need `route.api.enabled`.

> [!WARNING]
> Sync makes this server send `GET` requests to URIs announced by peers,
> including private network addresses. Run it only where that is acceptable,
> or disable `index.sync.enabled`.

## 🛠️ Development

| Command | What it does |
|---|---|
| `npm start -- --config <path> --port <port>` | Build and start API server |
| `npm run build` | Lint, compile, generate schemas and docs, build the GUI |
| `npm run build:server` | Compile the server TypeScript |
| `npm run build:schema` | Write `schema/**/*.json` from the `.ts` schemas |
| `npm run debug:multi` | Build and start three federated loopback servers |
| `npm run lint` | ESLint: unused code and copyright headers |
| `npm run doc` | Generate TypeDoc HTML in `gui/public/typedoc/` |
| `npm run install:gui` | Install the GUI's dependencies |
| `npm run build:gui` | Build the admin GUI into `dist/gui/` |
| `npm run dev:gui` | Generate docs and start the Vite GUI dev server |

Coding conventions, including one class per file, naming and the copyright
header, are described in [`AGENTS.md`](AGENTS.md).

### Schemas

Request and response bodies are defined in [`schema/`](schema) with
`PetQuerySchema`, a wrapper around
[TypeBox](https://github.com/sinclairzx81/typebox).
The path mirrors the route, for example
`schema/api/server/put/request.ts` for `PUT /api/server/put/:gid`.

- Each `.ts` file exports a class with a static `schema`, a `fromJson()`
  that returns a typed instance or throws, and a `...Type` type. Import it
  with `#schema/...`, for example `#schema/api/server/put/request.js`.
- Every JSON route validates its request with the request class's static
  `_handle()`, which calls the route handler with the typed request and sends
  the response it returns:

  ```ts
  app.put(
	'/api/server/put/:gid',
  	authenticate,
  	PetQuerySchemaApiServerPutRequest._handle.bind(
  		this,
  		this._handleAddServer.bind(this)
  	)
  );
  ```

  An invalid request returns `400` and a handler error `500`, both with
  `success: false` and the messages in `error`
  ([`schema/api/envelope.ts`](schema/api/envelope.ts)).
- The `.json` files next to them are JSON Schema for clients in other
  languages. They are generated; edit the `.ts` file and run
  `npm run build:schema` (part of `npm run build`).

### Admin GUI

The PetQuery GUI is a separate React app in [`gui/`](gui), built with Vite
and served from `/`, not from an API-server `/gui/` route. Install its
dependencies with `npm run install:gui`.

- **Development:** run `npm run dev:gui` and open the URL Vite prints,
  normally `http://127.0.0.1:5173/`. Vite proxies API requests using
  `PETQUERY_API_URL` from `gui/.env.local`; if it is missing, the GUI asks
  for the API origin and prompts you to restart Vite after saving it.
- **Production:** `npm run build:gui` writes the static app to `dist/gui/`.
  Host that directory at `/` and proxy `/api/*` and `/auth/*` to the API
  server on the same origin. TypeDoc and Swagger UI assets are included at
  `/typedoc/` and `/openapi/`.

The GUI has Home, Docs and Admin sections:

- **Home** and the PetQuery logo open `/search`, which queries the public
  `POST /api/pets/search` endpoint and can upload supporting files.
- **Docs** opens `/docs` and embeds TypeDoc at `/typedoc/` and Swagger UI
  at `/openapi/`.
- **Admin** opens `/admin/config` and contains Config, Servers, API clients,
  Users and Pets. Config edits the HTTP and HTTPS ports, session settings,
  LMDB, LDAP and OpenID Connect provider settings, result limits, file
  uploads, peer sync, API routes and plugins. It calls
  `GET /api/config/get` and `PUT /api/config/put`, which save to
  the database settings store. Changes apply when the server restarts; until
  then, the page shows a pending-restart notice.
- **Servers** lists, adds, edits and deletes entries in the server index.
- **API clients** manages bearer credentials for machine-to-machine access.
- **Users** manages local LMDB users with `admin` and `user` groups. LDAP and
  OpenID Connect users are displayed read-only from active sessions.
- **Pets** manages local records and lets admins upload preview and attachment
  images. Uploaded images are stored as data URIs; AI search indexes those
  local images and does not fetch remote image URLs.

Docs and search are public. Admin pages require authentication.
The `admin` group has full access; the `user` group can search and manage only
Pets. Machine-to-machine bearer credentials are managed as API clients.
GUI sessions use HttpOnly cookies and are stored in the configured session
database. Only the `admin` group can edit authentication settings. Since the
GUI is hosted separately, its availability is controlled by the static web
host, not a server `route.gui` setting.

## 📚 Documentation

TypeDoc reference documentation is generated from the source with
[TypeDoc](https://typedoc.org):

```bash
npm run doc
```

The generated site is written to `gui/public/typedoc/`. Open
`gui/public/typedoc/index.html`, or use the **Generate and Open Docs** debug
configuration in VS Code. `npm run build:gui` includes the TypeDoc site in
`dist/gui/`; the GUI's Docs page is available at `/docs`.

The Swagger UI and OpenAPI specification are in `gui/public/openapi/` and
are served by the GUI at `/openapi/`.

## 📄 License

See [`LICENSE`](LICENSE).

<div align="center">

Made with ❤️ for every pet that found its way home.

© ykat UG (haftungsbeschränkt)

</div>
