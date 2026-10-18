/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryServerDatabaseConfig} from
	'#petquery/server/database/config.js';
import { PetQuerySchemaServerDatabaseConfigEntry, type PetQuerySchemaServerDatabaseConfigEntryType } from "#schema/server/database/config/entry.js";
import { PetQueryDatabase } from '#petquery/database.js';
import { PetQueryDestructor } from '#petquery/destructor.js';

// Loads, validates and atomically saves the server settings that are
// editable in the admin GUI. Saved values take effect on restart.
export class PetQueryServerConfig extends PetQueryDestructor{
	protected readonly _database:PetQueryServerDatabaseConfig;
	protected readonly _serverUid:uuid_t;

	// pluginNames lists the plugins that route.api.plugins may contain.
	constructor(
		serverUid:uuid_t,
		database:PetQueryDatabase
	){
		super();
		this._serverUid = serverUid;
		this._database = database.getDbConfig();
	}

	async _destructor():Promise<void>{
	}

	// Extracts the editable values from server settings.
	fromServerConfig(
		config:PetQueryConfigServerType
	):PetQuerySchemaServerDatabaseConfigEntryType{
		const sync = config.index.sync;

		return {
			 serverUid:this._serverUid
			,http:{port:config.http.port}
			,authenticate:{
				 mode:config.authenticate.mode
				,providers:Array.from(config.authenticate.providers)
				,plugin_options:config.authenticate.plugin_options
				,bearer:Array.from(config.authenticate.bearer)
				,session:{
					 cookie_name:config.authenticate.session.cookie_name
					,max_age:config.authenticate.session.max_age
					,secure:config.authenticate.session.secure
				}
				,lmdb:{
					 users_name:config.authenticate.lmdb.users_name
					,sessions_name:config.authenticate.lmdb.sessions_name
				}
				,ldap:{
					 url:config.authenticate.ldap.url
					,bind_dn:config.authenticate.ldap.bind_dn
					,bind_password:config.authenticate.ldap.bind_password
					,base_dn:config.authenticate.ldap.base_dn
					,user_filter:config.authenticate.ldap.user_filter
					,admin_group:config.authenticate.ldap.admin_group
				}
				,oidc:{
					 issuer:config.authenticate.oidc.issuer
					,client_id:config.authenticate.oidc.client_id
					,client_secret:config.authenticate.oidc.client_secret
					,redirect_uri:config.authenticate.oidc.redirect_uri
					,scopes:config.authenticate.oidc.scopes
					,admin_group:config.authenticate.oidc.admin_group
				}
			}
			,file:{
				upload:{
					 enabled:config.file.upload.enabled
					,max_file_size:config.file.upload.max_file_size
				}
			}
			,max_results_per_module:config.max_results_per_module
			,max_results_total:config.max_results_total
			,index:{
				sync:{
					 enabled:sync.enabled
					,interval:sync.interval
					,timeout:sync.timeout
					,max_servers:sync.max_servers
				}
			}
			,route:{
				 api:{
					 enabled:config.route.api.enabled
					,plugins:Array.from(config.route.api.plugins)
				}
				,json:{enabled:config.route.json.enabled}
				,'/':{enabled:config.route['/'].enabled}
				,gui:{enabled:config.route.gui.enabled}
			}
		};
	}

	// Writes values into server settings in place, so references to nested
	// settings objects stay valid. Call before the server is created.
	applyToServerConfig(
		config:PetQueryConfigServerType,
		values:PetQuerySchemaServerDatabaseConfigEntryType
	):void{
		const sync = config.index.sync;

		config.http.port = values.http.port;
		config.authenticate.mode = values.authenticate.mode;
		config.authenticate.providers = Array.from(new Set(
			values.authenticate.providers
			?? [values.authenticate.mode,'bearer']
		));
		config.authenticate.plugin_options =
			values.authenticate.plugin_options ?? {};
		config.authenticate.bearer = new Set(values.authenticate.bearer);
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
		config.authenticate.ldap.base_dn = values.authenticate.ldap.base_dn;
		config.authenticate.ldap.user_filter =
			values.authenticate.ldap.user_filter;
		config.authenticate.ldap.admin_group =
			values.authenticate.ldap.admin_group;
		config.authenticate.oidc.issuer = values.authenticate.oidc.issuer;
		config.authenticate.oidc.client_id =
			values.authenticate.oidc.client_id;
		config.authenticate.oidc.client_secret =
			values.authenticate.oidc.client_secret;
		config.authenticate.oidc.redirect_uri =
			values.authenticate.oidc.redirect_uri;
		config.authenticate.oidc.scopes = values.authenticate.oidc.scopes;
		config.authenticate.oidc.admin_group =
			values.authenticate.oidc.admin_group;
		config.file.upload.enabled = values.file.upload.enabled;
		config.file.upload.max_file_size = values.file.upload.max_file_size;
		config.max_results_per_module = values.max_results_per_module;
		config.max_results_total = values.max_results_total;
		sync.enabled = values.index.sync.enabled;
		sync.interval = values.index.sync.interval;
		sync.timeout = values.index.sync.timeout;
		sync.max_servers = values.index.sync.max_servers;
		config.route.api.enabled = values.route.api.enabled;
		config.route.api.plugins = new Set(values.route.api.plugins);
		config.route.json.enabled = values.route.json.enabled;
		config.route['/'].enabled = values.route['/'].enabled;
		config.route.gui.enabled = values.route.gui.enabled;
	}

	// Validates untrusted JSON. Throws an Error
	// naming the invalid field.
	parse(json:json_t):PetQuerySchemaServerDatabaseConfigEntryType{
		return PetQuerySchemaServerDatabaseConfigEntry.fromJson(json);
	}

	// Returns the saved values, or null if nothing has been saved yet.
	async load():Promise<PetQuerySchemaServerDatabaseConfigEntryType>{
		return await this._database.serverConfigLoad(this._serverUid);
	}

	// Saves values returned by normalize() through the database backend.
	async save(values:PetQuerySchemaServerDatabaseConfigEntryType):Promise<void>{
		return this._database.serverConfigSave(this._serverUid,values);
	}
};
