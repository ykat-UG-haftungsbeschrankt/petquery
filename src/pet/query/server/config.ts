/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import type {
	PetQuerySchemaProperties,
	PetQuerySchemaStatic
} from '#petquery/schema.js';
import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryServerDatabaseConfig} from
	'#petquery/server/database/config.js';

const T = PetQuerySchema.type;
const flag = T.Boolean();
// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

export function _isNodeErrorCode(error:unknown,code:utf8_t):boolean{
	if(!(error instanceof Error) || !('code' in error)){
		return false;
	}
	const expectedCode = code;
	return expectedCode === error.code;
}

// Object that rejects unknown keys.
function strict<P extends PetQuerySchemaProperties>(properties:P){
	return T.Object(properties,{additionalProperties:false});
}

const schema = strict({
	 http:strict({
		port:T.Integer({minimum:1,maximum:65535})
	})
	,authenticate:strict({
		mode:T.Union([
			T.Literal('bearer'),
			T.Literal('lmdb'),
			T.Literal('ldap'),
			T.Literal('oidc')
		])
		// Printable ASCII without spaces, see authenticate() in config.ts.
		,bearer:T.Array(
			T.String({pattern:'^[\\x21-\\x7e]{16,256}$'}),
			{minItems:1,maxItems:100}
		)
		,session:strict({
			 cookie_name:T.String({
				pattern:'^[A-Za-z0-9._-]{1,64}$'
			})
			,max_age:T.Integer({minimum:60000,maximum:MAX_TIMER_MS})
			,secure:flag
		})
		,lmdb:strict({
			 users_name:T.String({minLength:1,maxLength:128})
			,sessions_name:T.String({minLength:1,maxLength:128})
		})
		,ldap:strict({
			 url:T.String({maxLength:4096})
			,bind_dn:T.String({maxLength:4096})
			,bind_password:T.String({maxLength:4096})
			,base_dn:T.String({maxLength:4096})
			,user_filter:T.String({maxLength:4096})
			,admin_group:T.String({maxLength:1024})
		})
		,oidc:strict({
			 issuer:T.String({maxLength:4096})
			,client_id:T.String({maxLength:1024})
			,client_secret:T.String({maxLength:4096})
			,redirect_uri:T.String({maxLength:4096})
			,scopes:T.String({maxLength:1024})
			,admin_group:T.String({maxLength:1024})
		})
	})
	,file:strict({
		upload:strict({
			 enabled:flag
			,max_file_size:T.Integer({minimum:1})
		})
	})
	,max_results_per_module:T.Integer({minimum:1,maximum:1000000})
	,max_results_total:T.Integer({minimum:1,maximum:1000000})
	,index:strict({
		sync:strict({
			 enabled:flag
			,interval:T.Integer({minimum:1000,maximum:MAX_TIMER_MS})
			,timeout:T.Integer({minimum:100,maximum:MAX_TIMER_MS})
			,max_servers:T.Integer({minimum:1,maximum:1000000})
		})
	})
	,route:strict({
		 api:strict({
			 enabled:flag
			,plugins:T.Array(T.String({minLength:1}),{maxItems:1000})
		})
		,json:strict({enabled:flag})
		,'/':strict({enabled:flag})
		,gui:strict({enabled:flag})
	})
});

export type PetQueryServerConfigValues = PetQuerySchemaStatic<typeof schema>;

// Loads, validates and atomically saves the server settings that are
// editable in the admin GUI. Saved values take effect on restart.
export class PetQueryServerConfig{
	// The editable values, as stored in the file and sent by the API.
	static readonly schema = schema;
	static readonly _validator = PetQuerySchema.compile(schema);

	protected readonly _database:PetQueryServerDatabaseConfig;
	protected readonly _pluginNames:Set<utf8_t>;

	// pluginNames lists the plugins that route.api.plugins may contain.
	constructor(
		database:PetQueryServerDatabaseConfig,
		pluginNames:Iterable<utf8_t>
	){
		this._database = database;
		this._pluginNames = new Set(pluginNames);
	}

	async destructor():Promise<void>{
	}

	// Extracts the editable values from server settings.
	static fromServerConfig(
		config:PetQueryConfigServerType
	):PetQueryServerConfigValues{
		const sync = config.index.sync;

		return {
			 http:{port:config.http.port}
			,authenticate:{
				 mode:config.authenticate.mode
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
	static applyToServerConfig(
		config:PetQueryConfigServerType,
		values:PetQueryServerConfigValues
	):void{
		const sync = config.index.sync;

		config.http.port = values.http.port;
		config.authenticate.mode = values.authenticate.mode;
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

	getPluginNames():Array<utf8_t>{
		return Array.from(this._pluginNames);
	}

	// Validates untrusted JSON, then normalize()s it. Throws an Error
	// naming the invalid field.
	parse(json:json_t):PetQueryServerConfigValues{
		return this.normalize(
			PetQuerySchema.parse(PetQueryServerConfig._validator,json)
		);
	}

	// Removes duplicates and checks the plugin names, which the schema
	// cannot. Throws an Error naming an unknown plugin.
	normalize(
		values:PetQueryServerConfigValues
	):PetQueryServerConfigValues{
		values.authenticate.bearer = Array.from(
			new Set(values.authenticate.bearer)
		);
		values.route.api.plugins = Array.from(
			new Set(values.route.api.plugins)
		);
		for(const name of values.route.api.plugins){
			if(!this._pluginNames.has(name)){
				throw new Error(
					`Invalid route.api.plugins, unknown plugin "${name}"`
				);
			}
		}

		return values;
	}

	// Returns the saved values, or null if nothing has been saved yet.
	async load():Promise<PetQueryServerConfigValues|null>{
		const saved = await this._database.serverConfigLoad();
		return null === saved ? null : this.parse(saved);
	}

	// Saves values returned by normalize() through the database backend.
	async save(values:PetQueryServerConfigValues):Promise<void>{
		return this._database.serverConfigSave(
			values
		);
	}
};
