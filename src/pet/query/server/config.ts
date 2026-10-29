/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDatabase } from '#petquery/database.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { PetQueryIp } from '#petquery/ip.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';

import { PetQueryConfig, type PetQueryConfigServerType } from '#petquery/config.js';
import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { PetQueryServerDatabaseConfig } from '#petquery/server/database/config.js';

// Loads, validates and saves the server configuration. Saved values take
// effect on restart.
export class PetQueryServerConfig extends PetQueryDestructor{
	protected readonly _database:PetQueryServerDatabaseConfig;
	protected readonly _gid:uuid_t;

	// pluginNames lists the plugins that route.api.plugins may contain.
	constructor(
		gid:uuid_t,
		database:PetQueryDatabase
	){
		super();
		this._gid = gid;
		this._database = database.getDbConfig();
	}

	async _destructor():Promise<void>{
	}

	// Returns the full config shape with current runtime values overlaid.
	fromServerConfig(
		config:PetQueryConfigServerType
	):PetQuerySchemaServerDatabaseConfigEntryType{
		const defaults = PetQueryConfig.getLoadedJson();
		const sync = config.index.sync;
		const providers = this._getInteractiveProviders(
			config.authenticate.providers
		);
		const firstProvider = providers[0];
		if(undefined === firstProvider){
			throw new Error(
				'Enable a password or redirect authentication provider'
			);
		}
		const mode = 'bearer' === config.authenticate.mode
			? firstProvider
			: config.authenticate.mode;

		return this._sanitize(this._mergeWithDefaults({
			...defaults,
			gid:this._gid,
			http:{
				...defaults.http,
				host:config.http.host,
				port:config.http.port,
				enabled:config.http.enabled,
				trusted_proxies:config.http.trusted_proxies
			},
			authenticate:{
				...defaults.authenticate,
				mode,
				providers,
				plugin_options:config.authenticate.plugin_options,
				bearer:[],
				session:{
					...defaults.authenticate.session,
					...config.authenticate.session
				},
				lmdb:{
					...defaults.authenticate.lmdb,
					...config.authenticate.lmdb
				},
				ldap:{
					...defaults.authenticate.ldap,
					...config.authenticate.ldap
				},
				oidc:{
					...defaults.authenticate.oidc,
					...config.authenticate.oidc
				}
			},
			file:{
				...defaults.file,
				upload:{
					...defaults.file.upload,
					enabled:config.file.upload.enabled,
					max_file_size:config.file.upload.max_file_size
				}
			},
			max_results_per_module:config.max_results_per_module,
			max_results_total:config.max_results_total,
			index:{
				...defaults.index,
				sync:{
					...defaults.index.sync,
					...sync
				}
			},
			route:{
				api:{
					...defaults.route.api,
					enabled:config.route.api.enabled,
					plugins:Array.from(config.route.api.plugins)
				}
			}
		}));
	}

	// Writes values into server settings in place, so references to nested
	// settings objects stay valid. Call before the server is created.
	applyToServerConfig(
		config:PetQueryConfigServerType,
		values:PetQuerySchemaServerDatabaseConfigEntryType
	):void{
		values = this._sanitize(this._mergeWithDefaults(values));
		const sync = config.index.sync;
		const providers = values.authenticate.providers;
		const trustedProxies = values.http.trusted_proxies;
		if(undefined === providers){
			throw new Error('Authentication providers are required');
		}
		if(undefined === trustedProxies){
			throw new Error('Trusted proxies are required');
		}

		config.http.port = values.http.port;
		config.http.trusted_proxies = trustedProxies;
		config.authenticate.mode = values.authenticate.mode;
		config.authenticate.providers = providers;
		config.authenticate.plugin_options =
			values.authenticate.plugin_options ?? {};
		config.authenticate.session.cookie_name =
			values.authenticate.session.cookie_name;
		config.authenticate.session.max_age =
			values.authenticate.session.max_age;
		config.authenticate.session.secure =
			values.authenticate.session.secure;
		config.authenticate.lmdb.users_name =
			values.authenticate.lmdb.users_name;
		config.authenticate.lmdb.sessions_name =
			values.authenticate.lmdb.sessions_name;
		config.authenticate.ldap.url = values.authenticate.ldap.url;
		config.authenticate.ldap.bind_dn =
			values.authenticate.ldap.bind_dn;
		config.authenticate.ldap.bind_password =
			values.authenticate.ldap.bind_password;
		config.authenticate.ldap.base_dn =
			values.authenticate.ldap.base_dn;
		config.authenticate.ldap.user_filter =
			values.authenticate.ldap.user_filter;
		config.authenticate.ldap.admin_group =
			values.authenticate.ldap.admin_group;
		config.authenticate.oidc.issuer =
			values.authenticate.oidc.issuer;
		config.authenticate.oidc.client_id =
			values.authenticate.oidc.client_id;
		config.authenticate.oidc.client_secret =
			values.authenticate.oidc.client_secret;
		config.authenticate.oidc.redirect_uri =
			values.authenticate.oidc.redirect_uri;
		config.authenticate.oidc.scopes =
			values.authenticate.oidc.scopes;
		config.authenticate.oidc.admin_group =
			values.authenticate.oidc.admin_group;
		config.file.upload.enabled = values.file.upload.enabled;
		config.file.upload.max_file_size =
			values.file.upload.max_file_size;
		config.max_results_per_module = values.max_results_per_module;
		config.max_results_total = values.max_results_total;
		sync.enabled = values.index.sync.enabled;
		sync.interval = values.index.sync.interval;
		sync.timeout = values.index.sync.timeout;
		sync.max_servers = values.index.sync.max_servers;
		config.route.api.enabled = values.route.api.enabled;
		config.route.api.plugins = new Set(values.route.api.plugins);
	}

	// Validates untrusted JSON. Throws an Error
	// naming the invalid field.
	parse(json:json_t):PetQuerySchemaServerDatabaseConfigEntryType{
		return this._sanitize(this._mergeWithDefaults(
			PetQuerySchemaServerDatabaseConfigEntry.fromJson(json)
		));
	}

	// Applies startup defaults to saved records written by older versions.
	protected _mergeWithDefaults(
		values:PetQuerySchemaServerDatabaseConfigEntryType
	):PetQuerySchemaServerDatabaseConfigEntryType{
		const defaults = PetQueryConfig.getLoadedJson();
		let https:PetQuerySchemaServerDatabaseConfigEntryType['https'];
		if(undefined === defaults.https){
			https = values.https;
		}else if(undefined === values.https){
			https = defaults.https;
		}else{
			https = {
				...defaults.https,
				...values.https,
				certificate:{
					...defaults.https.certificate,
					...values.https.certificate
				}
			};
		}
		const logging = undefined === defaults.logging
			&& undefined === values.logging
			? undefined
			: {
				...defaults.logging,
				...values.logging,
				request:{
					...defaults.logging?.request,
					...values.logging?.request
				},
				file:{
					...defaults.logging?.file,
					...values.logging?.file
				}
			};
		return {
			...defaults,
			...values,
			...(undefined === https ? {} : {https}),
			http:{
				...defaults.http,
				...values.http
			},
			authenticate:{
				...defaults.authenticate,
				...values.authenticate,
				session:{
					...defaults.authenticate.session,
					...values.authenticate.session
				},
				lmdb:{
					...defaults.authenticate.lmdb,
					...values.authenticate.lmdb
				},
				ldap:{
					...defaults.authenticate.ldap,
					...values.authenticate.ldap
				},
				oidc:{
					...defaults.authenticate.oidc,
					...values.authenticate.oidc
				}
			},
			file:{
				...defaults.file,
				...values.file,
				upload:{
					...defaults.file.upload,
					...values.file.upload
				}
			},
			index:{
				...defaults.index,
				...values.index,
				sync:{
					...defaults.index.sync,
					...values.index.sync
				}
			},
			route:{
				api:{
					...defaults.route.api,
					...values.route.api
				}
			},
			...(undefined === logging ? {} : {logging})
		};
	}

	// Returns saved values, falling back to the startup config.
	async load():Promise<PetQuerySchemaServerDatabaseConfigEntryType>{
		const config = await this._database.serverConfigLoad(this._gid);
		const values = config ?? {
			...PetQueryConfig.getLoadedJson(),
			gid:this._gid
		};
		return this._sanitize(this._mergeWithDefaults(values));
	}

	// Saves values returned by normalize() through the database backend.
	async save(
		values:PetQuerySchemaServerDatabaseConfigEntryType
	):Promise<void>{
		return this._database.serverConfigSave(
			this._gid,
			this._sanitize(this._mergeWithDefaults(values))
		);
	}

	protected _sanitize(
		values:PetQuerySchemaServerDatabaseConfigEntryType
	):PetQuerySchemaServerDatabaseConfigEntryType{
		const expectedGid = this._gid;
		if(expectedGid !== values.gid){
			throw new Error('Configuration gid does not match');
		}
		const {
			bearer:UNUSED_bearer,
			bearer_env:UNUSED_bearer_env,
			...authenticate
		} =
			values.authenticate;
		const http = {
			...values.http,
			trusted_proxies:PetQueryIp.validateTrustedProxies(
				values.http.trusted_proxies ?? []
			)
		};
		const providers = this._getInteractiveProviders(
			authenticate.providers ?? [authenticate.mode]
		);
		const firstProvider = providers[0];
		if(undefined === firstProvider){
			throw new Error(
				'Enable a password or redirect authentication provider'
			);
		}
		return {
			...values,
			gid:this._gid,
			http,
			authenticate:{
				...authenticate,
				mode:'bearer' === authenticate.mode
					? firstProvider
					: authenticate.mode,
				bearer:[],
				providers
			}
		};
	}

	protected _getInteractiveProviders(
		values:Array<utf8_t>
	):Array<utf8_t>{
		const providers:Array<utf8_t> = [];
		for(const value of values){
			if('bearer' !== value && !providers.includes(value)){
				providers.push(value);
			}
		}
		return providers;
	}
};
