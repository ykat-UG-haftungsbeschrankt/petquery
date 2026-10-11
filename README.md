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
- 🔁 **Loop-safe**: each server has its own UUID, and queries carry a
  traceroute of the servers they have passed through, so loops between
  federated servers can be spotted.
- 🛡️ **Validated I/O**: incoming and remote JSON is checked with
  [`cast.ts`](https://www.npmjs.com/package/cast.ts) before it is used.
- 🔐 **Bearer authentication** for the machine-facing endpoints.
- 📎 **File uploads**: photos or documents can be attached to a query and are
  passed on to the plugins.

## 🧭 How it works

```mermaid
flowchart LR
    U([🧑 User / Authority]) -->|query| S[🐾 petquery server]
    S --> A[animalid.by]
    S --> M[(MySQL)]
    S --> D[(MongoDB)]
    S --> P[🐾 another petquery server]
    A & M & D & P -->|results| S
    S -->|merged result| U
```

## 🚀 Quick start

```bash
git clone https://github.com/ykat-UG-haftungsbeschrankt/petquery.git
cd petquery
npm install
npm start
```

`npm start` lints and compiles the TypeScript sources to native ES modules in
`dist/`, then starts the server on <http://127.0.0.1:50000/>.

> [!TIP]
> In VS Code, use the **Launch PetQuery** debug configuration. It builds the
> project, starts the server and opens it in your browser.

## ⚙️ Configuration

All settings are in
[`src/pet/query/config.ts`](src/pet/query/config.ts):

| Setting | What it does |
|---|---|
| `server.http` / `server.https` | Ports, on/off switches and the TLS certificate |
| `server.authenticate.bearer` | The bearer tokens accepted by `/json` and `/api` |
| `server.config_file` | Saved admin GUI settings (`config/server.json`) |
| `server.file.upload` | Upload switch and `max_file_size` (10 MB) |
| `server.max_results_per_module` | Maximum number of results kept per plugin |
| `server.max_results_total` | Maximum number of results in a response |
| `server.server_index` | LMDB directory, database names and peer sync of the server index |
| `server.route` | Turns each endpoint on or off and sets its authentication |
| `plugin` | One entry per plugin: on/off, timeout, source and settings |

At startup, values saved by the [admin GUI](#admin-gui) in
`config/server.json` override these defaults. The file is git-ignored,
readable only by its owner and holds the bearer tokens.

> [!IMPORTANT]
> Replace the example bearer tokens with your own secrets before you deploy.

## 🌐 Endpoints

| Endpoint | Auth | Returns | Turned on by |
|---|:---:|---|---|
| `/` | — | HTML search page | `route["/"].enabled` |
| `/json` | 🔐 | Merged results from **all** plugins | `route.json.enabled` |
| `/api` | 🔐 | Results from **one** plugin only | `route.api.enabled` |
| `/api/server` | 🔐 | Manage the server index (list and ping are public) | `route.api.enabled` |
| `/api/config` | 🔐 | Read or save the editable config | `route.api.enabled` |
| `/admin` | — | Admin GUI (see [Admin GUI](#admin-gui)) | `route.admin.enabled` |

Every search endpoint accepts `GET` query strings, JSON or form `POST`
bodies, and `multipart/form-data` file uploads.

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | The pet ID to look up, e.g. a microchip number |
| `tracerouteUuid` | `uuid[]` | Servers the query has passed through (federation) |

### `/json`: search everything

Use this to show petquery results on your own website or in your own
application.

<details open>
<summary><b>JavaScript</b></summary>

```js
const response = await fetch('https://petquery.org/json', {
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
	'https://petquery.org/json',
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
curl -X POST https://petquery.org/json \
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
			"attributes": {"name": {"first": "Bob", "last": "Smith"}}
		}
	]
}
```

### `/api`: share your own registry

`/api` returns results from the **single** plugin named in `route.api.module`,
as a plain array of result entries.

This is how authorities share their data. Run petquery next to your local
database, expose it through `/api`, and give other petquery servers a token.
They add your server as a `petquery` plugin, with your URL and token in their
config, and your registry becomes part of their search. Your database itself
is never exposed.

```js
const response = await fetch('https://petquery.org/api', {
	method: 'POST',
	headers: {
		'content-type': 'application/json',
		'authorization': 'Bearer <your-token>'
	},
	body: JSON.stringify({query: '112093400000465'})
});
console.log(await response.json());
```

### `/api/server`: manage the server index

These routes manage the [persistent server index](#persistent-server-index).
`GET` routes are public so that peers can sync; `PUT` and `DELETE` use the
same authentication as `/api`.

| Method | Path | Body | Action |
|---|---|---|---|
| `GET` | `/api/ping` | — | Return this server's UUID as `data.uuid` |
| `GET` | `/api/server` | — | List all servers |
| `PUT` | `/api/server/:uuid` | `uri` (JSON or form) | Add or replace a server |
| `DELETE` | `/api/server/:uuid` | — | Delete a server |

Responses are JSON with `success` and `error`; the list also has `data`, an
array of `{uuid, uri}` objects. An invalid UUID or a missing or non-absolute
URI returns `400`, and a database error returns `500`. Deleting a missing
UUID succeeds.

```js
await fetch(
	'https://petquery.org/api/server/550e8400-e29b-41d4-a716-446655440000',
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

Then add its config to the `plugin` map in `config.ts` and register it in
`index.ts`:

```ts
server.addPlugin(new PetQueryPluginMyRegistry(
	PetQueryConfig.getPluginConfig(
		PetQueryPluginMyRegistryConfig,
		'my-registry'
	)
));
```

## Persistent server index

`PetQueryServerIndex` stores UUID-to-URI entries in a
`PetQueryServerDatabase`, an asynchronous key-value backend.
`PetQueryServerDatabaseLmdb` is the LMDB implementation; pass it a database
directory and a database name. Reopening that directory restores the entries.
Other backends can extend `PetQueryServerDatabase`.

`index.ts` creates the index from `server.server_index` (by default
`var/lmdb` in the working directory), passes it to `PetQueryServer`, and
closes the database on `SIGINT` or `SIGTERM`. Routes reach it through
`server._getServerIndex()`.

The server's UUID is generated on first start and stored in the
`settings_name` database of the same LMDB directory, so it stays the same
across restarts. Deleting that directory gives the server a new identity.

```ts
import {PetQueryServerDatabaseLmdb} from
	'#petquery/server/database/lmdb.js';
import {PetQueryServerIndex} from '#petquery/server/index.js';

const db = new PetQueryServerDatabaseLmdb(
	'/var/lib/petquery/servers',
	'servers'
);
const serverIndex = new PetQueryServerIndex(db);
try{
	await serverIndex.addServer(
		'550e8400-e29b-41d4-a716-446655440000',
		'https://registry.example.org/'
	);
	const servers:Map<uuid_t,uri_t> = await serverIndex.getServerList();
	console.log(servers);
	await serverIndex.deleteServer('550e8400-e29b-41d4-a716-446655440000');
}
finally{
	serverIndex.destructor();
	await db.destructor();
}
```

`addServer()` persists an entry, replacing the URI when its UUID already
exists. UUIDs must be valid and URIs must be absolute. `deleteServer()`
removes an entry; a missing UUID is a no-op. `getServerList()` returns an
independent `Map` snapshot, so modifying it does not modify the database.
The index borrows the database, so the database's owner must await its
`destructor()`. Database errors propagate to the caller, and operations after
destruction reject. Keep the database directory outside the source tree.

### Peer sync

When `server_index.sync.enabled` is on, `PetQueryServerIndexSync` syncs the
index at startup and then every `sync.interval` after the previous run ends.
For each known server, it fetches `GET <uri>/api/server` and merges the
returned entries:

- Entries with this server's own UUID, and entries already known with the
  same URI, are skipped.
- Other entries must use `http` or `https`. Each is added, or replaces the
  known URI, only if `GET <uri>/api/ping` answers with the same UUID.
- Unreachable servers and rejected entries are logged and skipped; nothing
  is deleted.

The URI of a server is its base URL; `api/...` is resolved under its path.
Requests time out after `sync.timeout`, do not follow redirects, and read at
most `sync.max_servers` entries per peer. Peers need `route.api.enabled`.

> [!WARNING]
> Sync makes this server send `GET` requests to URIs announced by peers,
> including private network addresses. Run it only where that is acceptable,
> or disable `server_index.sync.enabled`.

## 🛠️ Development

| Command | What it does |
|---|---|
| `npm start` | Build, then start the server |
| `npm run build` | Lint, compile to `dist/`, then build the admin GUI |
| `npm run lint` | ESLint: unused code and copyright headers |
| `npm run doc` | Generate the API documentation into `docs/` |
| `npm run install:gui` | Install the admin GUI's dependencies |
| `npm run build:gui` | Build the admin GUI into `dist/gui/` |
| `npm run dev:gui` | Start the admin GUI dev server with hot reload |

Coding conventions, including one class per file, naming and the copyright
header, are described in [`AGENTS.md`](AGENTS.md).

### Admin GUI

The admin GUI at `/admin` is a React app in [`gui/`](gui), built with Vite.
It has its own dependencies, so install them once with
`npm run install:gui` before building.

- **Production:** `npm run build` writes the GUI to `dist/gui/`, which
  `route.admin.path` points to. Without a build, `/admin` returns `503`.
- **Development:** start the server, then run `npm run dev:gui` and open
  `http://localhost:5173/admin/`. The dev server forwards `/api` to the
  server on port 50000.

The GUI has two pages, selected from the menu:

- **Config** edits the HTTP port, bearer tokens, result limits, file
  upload, peer sync, routes and `/api` plugins. It calls `GET` and
  `PUT /api/config`, which save to `config/server.json`. Changes apply
  when the server restarts; until then, the page shows a pending-restart
  notice.
- **Servers** lists, adds, edits and deletes entries in the server index.

The pages are public; listing servers needs no token. Viewing the config
and changing servers need one of the `server.authenticate.bearer` tokens.
Anyone with a token can also edit the tokens. The GUI keeps
the token in the browser tab's `sessionStorage` until you click **Forget**
or close the tab. Turn the GUI off with `route.admin.enabled`.

## 📚 Documentation

The API documentation is generated from the source with
[TypeDoc](https://typedoc.org):

```bash
npm run doc
```

Then open `docs/index.html`, or use the **Generate and Open Docs** debug
configuration in VS Code.

## 📄 License

See [`LICENSE`](LICENSE).

<div align="center">

Made with ❤️ for every pet that found its way home.

© ykat UG (haftungsbeschränkt)

</div>
