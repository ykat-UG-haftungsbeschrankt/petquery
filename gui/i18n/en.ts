/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export const enMessages = {
	"Automatic (browser)":
		"Automatic (browser)",
	"Language":
		"Language",
	"English":
		"English",
	"Home":
		"Home",
	"Documentation":
		"Documentation",
	"Admin":
		"Admin",
	"Administration":
		"Administration",
	"Admin sections":
		"Admin sections",
	"Authentication":
		"Authentication",
	"Configure this server or manage federated peers.":
		"Configure this server or manage federated peers.",
	"Documentation sections":
		"Documentation sections",
	"API":
		"API",
	"PetQuery API reference":
		"PetQuery API reference",
	"PetQuery documentation":
		"PetQuery documentation",
	"API clients":
		"API clients",
	"Config":
		"Config",
	"Logs":
		"Logs",
	"Request logs":
		"Request logs",
	"Servers":
		"Servers",
	"Users":
		"Users",
	"Pets":
		"Pets",
	"Checking your session...":
		"Checking your session...",
	"Checking...":
		"Checking...",
	"Initial setup":
		"Initial setup",
	"Sign out":
		"Sign out",
	"Public":
		"Public",
	"Selected authentication provider is unavailable":
		"Selected authentication provider is unavailable",
	"Selected provider uses redirect sign-in":
		"Selected provider uses redirect sign-in",
	"Sign in to PetQuery Admin":
		"Sign in to PetQuery Admin",
	"No login providers are enabled.":
		"No login providers are enabled.",
	"Sign-in provider":
		"Sign-in provider",
	"Continue to {provider}":
		"Continue to {provider}",
	"Continue with {provider}.":
		"Continue with {provider}.",
	"Sign in with your {provider} account.":
		"Sign in with your {provider} account.",
	"Username":
		"Username",
	"Password":
		"Password",
	"Signing in...":
		"Signing in...",
	"Sign in":
		"Sign in",
	"First-time setup":
		"First-time setup",
	"Create the administrator account":
		"Create the administrator account",
	"Passwords do not match":
		"Passwords do not match",
	"Initial setup did not create an admin session":
		"Initial setup did not create an admin session",
	"Confirm password":
		"Confirm password",
	"Creating admin...":
		"Creating admin...",
	"Create admin":
		"Create admin",
	"setup.firstAdminWarning":
		"This server has no local administrator. The first client to "
		+"complete setup becomes the administrator. Continue only on a "
		+"network you trust.",
	"ms":
		"ms",
	"s":
		"s",
	"min":
		"min",
	"Plugin options must be a JSON object":
		"Plugin options must be a JSON object",
	"Invalid plugin options JSON":
		"Invalid plugin options JSON",
	"Disabling the admin route turns off this GUI.":
		"Disabling the admin route turns off this GUI.",
	"config.disableApiWarning":
		"Disabling the API route also disables /api/config/* and "
		+"/api/server/*. This page will stop working after a restart.",
	"Viewing and editing the config requires an admin session.":
		"Viewing and editing the config requires an admin session.",
	"Load":
		"Load",
	"Discard unsaved changes?":
		"Discard unsaved changes?",
	"{warnings}\n\nSave anyway?":
		"{warnings}\n\nSave anyway?",
	"Saved changes take effect when the server restarts:":
		"Saved changes take effect when the server restarts:",
	"HTTP":
		"HTTP",
	"Port":
		"Port",
	"Trusted proxy IPs/CIDRs":
		"Trusted proxy IPs/CIDRs",
	"config.trustedProxyHelp":
		"One trusted proxy IP or CIDR per line. Only trust "
		+"X-Forwarded-For from these proxies. Leave empty for direct "
		+"connections.",
	"Enabled providers":
		"Enabled providers",
	"config.providerHelp":
		"Enter one registered provider name per line. Names are selected "
		+"explicitly at sign in.",
	"Legacy mode value (compatibility only)":
		"Legacy mode value (compatibility only)",
	"Common legacy mode values":
		"Common legacy mode values",
	"LMDB users":
		"LMDB users",
	"LDAP":
		"LDAP",
	"OpenID Connect":
		"OpenID Connect",
	"Secure session cookie":
		"Secure session cookie",
	"Session cookie name":
		"Session cookie name",
	"Session lifetime (ms)":
		"Session lifetime (ms)",
	"Users database":
		"Users database",
	"Sessions database":
		"Sessions database",
	"LDAP URL":
		"LDAP URL",
	"Bind DN":
		"Bind DN",
	"Bind password":
		"Bind password",
	"User base DN":
		"User base DN",
	"User filter":
		"User filter",
	"Admin group":
		"Admin group",
	"Issuer":
		"Issuer",
	"Client ID":
		"Client ID",
	"Client secret":
		"Client secret",
	"Redirect URI":
		"Redirect URI",
	"Scopes":
		"Scopes",
	"Provider options (JSON)":
		"Provider options (JSON)",
	"Results":
		"Results",
	"Max results per plugin":
		"Max results per plugin",
	"Max results in total":
		"Max results in total",
	"File upload":
		"File upload",
	"Enabled":
		"Enabled",
	"Max file size (bytes)":
		"Max file size (bytes)",
	"Peer sync":
		"Peer sync",
	"Interval (ms)":
		"Interval (ms)",
	"Request timeout (ms)":
		"Request timeout (ms)",
	"Max servers read per peer":
		"Max servers read per peer",
	"Routes":
		"Routes",
	"/api (includes this page's API)":
		"/api (includes this page's API)",
	"/ (this GUI)":
		"/ (this GUI)",
	"Plugins queried by /api":
		"Plugins queried by /api",
	"Save":
		"Save",
	"Reset":
		"Reset",
	"Reload":
		"Reload",
	"Unsaved: {paths}":
		"Unsaved: {paths}",
	"No unsaved changes.":
		"No unsaved changes.",
	"All listed API calls":
		"All listed API calls",
	"API permissions":
		"API permissions",
	"Allowed IPs":
		"Allowed IPs",
	"Last updated":
		"Last updated",
	"Revoke API client \"{name}\"?":
		"Revoke API client \"{name}\"?",
	"Copy the new API-client token":
		"Copy the new API-client token",
	"apiClients.oneTimeToken":
		"This token is shown only once. Store it securely; the server "
		+"keeps only its hash.",
	"Dismiss":
		"Dismiss",
	"apiClients.description":
		"Manage bearer credentials for API and server-to-server requests. "
		+"These clients cannot sign in to the admin GUI.",
	"Refresh":
		"Refresh",
	"No API clients have been created.":
		"No API clients have been created.",
	"Edit":
		"Edit",
	"Revoke":
		"Revoke",
	"Create API client":
		"Create API client",
	"Edit API client":
		"Edit API client",
	"Rotate token":
		"Rotate token",
	"Rotate API-client token for \"{name}\"? This revokes the current token.":
		"Rotate API-client token for \"{name}\"? This revokes the current "
		+"token.",
	"Name":
		"Name",
	"Allowed source IPs":
		"Allowed source IPs",
	"apiClients.allowedSourceIpsHelp":
		"Enter exact IPv4 or IPv6 addresses, one per line. Use * to allow "
		+"any source IP. For proxied requests, configure proxy IPs/CIDRs "
		+"in Config, under HTTP; only their X-Forwarded-For values are "
		+"trusted.",
	"Allowed API calls":
		"Allowed API calls",
	"apiClients.scopesHelp":
		"Scopes apply when this bearer token is used. Existing public API "
		+"routes remain available without a token.",
	"All listed /api calls":
		"All listed /api calls",
	"apiClients.adminSessionHelp":
		"API-client management and user-management routes always require "
		+"an admin session.",
	"Create client":
		"Create client",
	"Save client":
		"Save client",
	"Cancel":
		"Cancel",
	"Read server status":
		"Read server status",
	"List known servers":
		"List known servers",
	"Add or update a server":
		"Add or update a server",
	"Remove a server":
		"Remove a server",
	"Read application logs":
		"Read application logs",
	"Read request logs":
		"Read request logs",
	"Read server configuration":
		"Read server configuration",
	"Update server configuration":
		"Update server configuration",
	"Search pets":
		"Search pets",
	"Report a pet sighting":
		"Report a pet sighting",
	"List pets":
		"List pets",
	"Create a pet":
		"Create a pet",
	"Read a pet":
		"Read a pet",
	"Update a pet":
		"Update a pet",
	"Delete a pet":
		"Delete a pet",
	"Filter {label}":
		"Filter {label}",
	"Sort by":
		"Sort by",
	"Sort ascending":
		"Sort ascending",
	"Sort descending":
		"Sort descending",
	"Ascending":
		"Ascending",
	"Descending":
		"Descending",
	"No {label} match the filter.":
		"No {label} match the filter.",
	"Actions":
		"Actions",
	"{label} results":
		"{label} results",
	"Attached file {number}":
		"Attached file {number}",
	"Attached file {number}: invalid attachment URL.":
		"Attached file {number}: invalid attachment URL.",
	"Attached file {number}: unsupported attachment URL.":
		"Attached file {number}: unsupported attachment URL.",
	"Open {label}":
		"Open {label}",
	"Preview of {label}":
		"Preview of {label}",
	"Your browser does not support video previews.":
		"Your browser does not support video previews.",
	"Preview unavailable. Use the attachment link to open it.":
		"Preview unavailable. Use the attachment link to open it.",
	"Delete user {username}?":
		"Delete user {username}?",
	"Manage local users and review external identities.":
		"Manage local users and review external identities.",
	"User management provider":
		"User management provider",
	"No users found.":
		"No users found.",
	"Delete":
		"Delete",
	"Add user":
		"Add user",
	"Edit user":
		"Edit user",
	"Display name":
		"Display name",
	"Group":
		"Group",
	"User":
		"User",
	"Create user":
		"Create user",
	"Save user":
		"Save user",
	"No enabled provider supports user management.":
		"No enabled provider supports user management.",
	"Never":
		"Never",
	"Not pinged":
		"Not pinged",
	"GID":
		"GID",
	"URI":
		"URI",
	"Admin contact":
		"Admin contact",
	"Company address":
		"Company address",
	"Ping latency (ms)":
		"Ping latency (ms)",
	"Added time":
		"Added time",
	"Updated time":
		"Updated time",
	"Last ping time":
		"Last ping time",
	"Delete server {gid}?":
		"Delete server {gid}?",
	"This server:":
		"This server:",
	"servers.peerSharingHelp":
		"Ping latency is measured from this server. Contact and address "
		+"details are shared with connected peers.",
	"No servers known.":
		"No servers known.",
	"Add or replace server":
		"Add or replace server",
	"Pet GID":
		"Pet GID",
	"Species":
		"Species",
	"Owner contact":
		"Owner contact",
	"No pets found.":
		"No pets found.",
	"Delete pet {gid}?":
		"Delete pet {gid}?",
	"Manage the local pet JSON database.":
		"Manage the local pet JSON database.",
	"Add pet":
		"Add pet",
	"Edit pet":
		"Edit pet",
	"Notes":
		"Notes",
	"Upload preview image":
		"Upload preview image",
	"Choose a PNG, JPEG, GIF, WebP, AVIF, or BMP image.":
		"Choose a PNG, JPEG, GIF, WebP, AVIF, or BMP image.",
	"Could not read image \"{name}\"":
		"Could not read image \"{name}\"",
	"Saved image {number}":
		"Saved image {number}",
	"Saved preview image":
		"Saved preview image",
	"Pet preview":
		"Pet preview",
	"Remove preview image":
		"Remove preview image",
	"Source {field}":
		"Source {field}",
	"Attributes":
		"Attributes",
	"Attribute {number} key":
		"Attribute {number} key",
	"Attribute {number} value":
		"Attribute {number} value",
	"Remove":
		"Remove",
	"Add attribute":
		"Add attribute",
	"Upload attachment images":
		"Upload attachment images",
	"Remove image":
		"Remove image",
	"Create pet":
		"Create pet",
	"Save pet":
		"Save pet",
	"Enter a microchip ID or select files.":
		"Enter a microchip ID or select files.",
	"Federated pet lookup":
		"Federated pet lookup",
	"Find a pet. Bring them home.":
		"Find a pet. Bring them home.",
	"Search enabled registries with a microchip ID, files, or both.":
		"Search enabled registries with a microchip ID, files, or both.",
	"One search across trusted sources":
		"One search across trusted sources",
	"Microchip ID":
		"Microchip ID",
	"Files":
		"Files",
	"Searching...":
		"Searching...",
	"Search for a pet":
		"Search for a pet",
	"One tiny chip. A whole lot of hope.":
		"One tiny chip. A whole lot of hope.",
	"Why PetQuery?":
		"Why PetQuery?",
	"search.missingPetIntro":
		"When a pet goes missing, people often search only the registries "
		+"close to home. A pet that crosses a border can be hard to find.",
	"search.petQueryDescription":
		"PetQuery is a plugin-based, federated search for pet microchip "
		+"IDs. It checks configured sources in parallel and brings the "
		+"results together.",
	"Features":
		"Features",
	"Parallel plugin search":
		"Parallel plugin search",
	"Search by image":
		"Search by image",
	"Federated and loop-safe":
		"Federated and loop-safe",
	"Validated and protected":
		"Validated and protected",
	"Validated I/O":
		"Validated I/O",
	"Share helpful files":
		"Share helpful files",
	"Reunite pets and people":
		"Reunite pets and people",
	"Build with the API":
		"Build with the API",
	"Search connected registries":
		"Search connected registries",
	"Magnifying glass connected to three pet registries":
		"Magnifying glass connected to three pet registries",
	"search.registrySearchFeature":
		"One microchip ID is checked across enabled plugins in parallel. "
		+"A slow source never blocks the others.",
	"A pet photo matched against local records":
		"A pet photo matched against local records",
	"search.imageSearchFeature":
		"Uploaded pet photos can be matched against local records with "
		+"the built-in AI image search.",
	"A document with a paw print and upload arrow":
		"A document with a paw print and upload arrow",
	"search.fileSharingFeature":
		"Photos or documents can also be passed to configured plugins "
		+"when a text-only search is not enough.",
	"Connected PetQuery servers sharing search results":
		"Connected PetQuery servers sharing search results",
	"search.loopSafeFeature":
		"Servers can query each other without sharing databases. A "
		+"traceroute helps prevent query loops.",
	"API brackets surrounding a paw print":
		"API brackets surrounding a paw print",
	"search.validationFeature":
		"Incoming and remote data is validated. Management endpoints "
		+"require the appropriate sign-in.",
	"Two paws connected by a heart":
		"Two paws connected by a heart",
	"search.reunionFeature":
		"Local records and trusted connected servers can help turn a "
		+"promising match into a happy reunion.",
	"API code brackets surrounding a paw print":
		"API code brackets surrounding a paw print",
	"search.apiFeature":
		"Use the JSON endpoints to add PetQuery searches to your own "
		+"website, shelter workflow, or rescue tool.",
	"How it works":
		"How it works",
	"1. Send a query":
		"1. Send a query",
	"Enter a chip ID, add a photo, or do both.":
		"Enter a chip ID, add a photo, or do both.",
	"Registry plugins":
		"Registry plugins",
	"Local records and AI image search":
		"Local records and AI image search",
	"Connected PetQuery servers":
		"Connected PetQuery servers",
	"2. Get combined results":
		"2. Get combined results",
	"Matches return together in one response.":
		"Matches return together in one response.",
	"Found {count} result":
		"Found {count} result",
	"Found {count} results":
		"Found {count} results",
	"Complete":
		"Complete",
	"Partial":
		"Partial",
	"Some registries reported errors":
		"Some registries reported errors",
	"No matching pet was found.":
		"No matching pet was found.",
	"Distance":
		"Distance",
	"No last seen location":
		"No last seen location",
	"Last seen":
		"Last seen",
	"Enable your location to calculate":
		"Enable your location to calculate",
	"Last seen contact":
		"Last seen contact",
	"Report last seen":
		"Report last seen",
	"Preview from {source}":
		"Preview from {source}",
	"Last seen saved.":
		"Last seen saved.",
	"This publicly updates the pet immediately on":
		"This publicly updates the pet immediately on",
	"Your contact details will be visible in search results.":
		"Your contact details will be visible in search results.",
	"The sighting time is set to the moment you save.":
		"The sighting time is set to the moment you save.",
	"Refresh my current location":
		"Refresh my current location",
	"Your current location is pre-selected. Click the map to adjust it.":
		"Your current location is pre-selected. Click the map to adjust "
		+"it.",
	"Latitude":
		"Latitude",
	"Longitude":
		"Longitude",
	"Contact name":
		"Contact name",
	"Contact email":
		"Contact email",
	"Contact phone":
		"Contact phone",
	"Save public sighting":
		"Save public sighting",
	"Your browser does not support geolocation.":
		"Your browser does not support geolocation.",
	"Location unavailable: {message}":
		"Location unavailable: {message}",
	"Map: click to set the sighting location":
		"Map: click to set the sighting location",
	"logs.requestPrivacy":
		"Showing up to 100 newest requests. Query strings and bodies are "
		+"not recorded.",
	"Showing up to 100 newest log entries.":
		"Showing up to 100 newest log entries.",
	"Level":
		"Level",
	"All levels":
		"All levels",
	"Search request lines":
		"Search request lines",
	"Search message":
		"Search message",
	"Loading...":
		"Loading...",
	"Search requests":
		"Search requests",
	"Search logs":
		"Search logs",
	"No matching request logs.":
		"No matching request logs.",
	"No matching log entries.":
		"No matching log entries.",
	"error":
		"error",
	"warn":
		"warn",
	"info":
		"info",
	"debug":
		"debug",
	"users":
		"users",
	"pets":
		"pets",
	"servers":
		"servers",
	"favicon":
		"favicon",
	"url":
		"url",
	"name":
		"name",
	"API client token":
		"API client token",
	"Clients send one of these as":
		"Clients send one of these as",
	"At least 16 printable characters, no spaces.":
		"At least 16 printable characters, no spaces.",
	"They cannot sign in to the admin GUI.":
		"They cannot sign in to the admin GUI.",
	"Connect to the PetQuery API":
		"Connect to the PetQuery API",
	"Enter the origin of the running API server.":
		"Enter the origin of the running API server.",
	"Vite saves the address in gui/.env.local for the local proxy.":
		"Vite saves the address in gui/.env.local for the local proxy.",
	"API server origin":
		"API server origin",
	"Use an HTTP(S) origin without a path, query, or credentials.":
		"Use an HTTP(S) origin without a path, query, or credentials.",
	"Enter a valid HTTP(S) API origin.":
		"Enter a valid HTTP(S) API origin.",
	"Unable to save the API endpoint.":
		"Unable to save the API endpoint.",
	"Unexpected API endpoint response.":
		"Unexpected API endpoint response.",
	"Endpoint saved. Restart Vite to connect.":
		"Endpoint saved. Restart Vite to connect.",
	"Save endpoint":
		"Save endpoint",
	"Saving endpoint...":
		"Saving endpoint...",
	"Bootstrap server settings":
		"Bootstrap server settings",
	"The configuration will be saved to the selected startup file.":
		"The configuration will be saved to the selected startup file.",
	"The administrator account is created after the server starts.":
		"The administrator account is created after the server starts.",
	"Enable HTTP or HTTPS so the server can accept API requests.":
		"Enable HTTP or HTTPS so the server can accept API requests.",
	"At least one authentication provider is required.":
		"At least one authentication provider is required.",
	"Provide a TLS key and certificate to enable HTTPS.":
		"Provide a TLS key and certificate to enable HTTPS.",
	"Unable to save bootstrap configuration.":
		"Unable to save bootstrap configuration.",
	"Unexpected response from the bootstrap server.":
		"Unexpected response from the bootstrap server.",
	"Server identity":
		"Server identity",
	"Public API endpoint URI":
		"Public API endpoint URI",
	"HTTP host":
		"HTTP host",
	"HTTPS":
		"HTTPS",
	"HTTPS host":
		"HTTPS host",
	"HTTPS port":
		"HTTPS port",
	"TLS private key":
		"TLS private key",
	"TLS certificate":
		"TLS certificate",
	"Database backend":
		"Database backend",
	"LMDB":
		"LMDB",
	"PostgreSQL":
		"PostgreSQL",
	"MariaDB":
		"MariaDB",
	"MongoDB":
		"MongoDB",
	"Redis":
		"Redis",
	"SQLite":
		"SQLite",
	"LMDB data path":
		"LMDB data path",
	"PostgreSQL connection string":
		"PostgreSQL connection string",
	"MariaDB connection string":
		"MariaDB connection string",
	"MongoDB connection string":
		"MongoDB connection string",
	"MongoDB database name":
		"MongoDB database name",
	"Redis connection string":
		"Redis connection string",
	"SQLite data path":
		"SQLite data path",
	"AI search database path":
		"AI search database path",
	"Authentication mode":
		"Authentication mode",
	"LMDB authentication":
		"LMDB authentication",
	"LDAP settings":
		"LDAP settings",
	"OpenID Connect settings":
		"OpenID Connect settings",
	"Logging":
		"Logging",
	"Log level":
		"Log level",
	"Request logging":
		"Request logging",
	"Log file path":
		"Log file path",
	"Log file max size (bytes)":
		"Log file max size (bytes)",
	"Max log files":
		"Max log files",
	"Save and start server":
		"Save and start server",
	"Saving bootstrap configuration...":
		"Saving bootstrap configuration...",
	"Configuration saved. Starting the API server...":
		"Configuration saved. Starting the API server...",
} as const;
