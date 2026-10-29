/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDatabase } from '#petquery/database.js';
import { PetQueryDatabaseEx } from '#petquery/database.js';
import { PetQueryDatabaseLmdb } from '#petquery/database/lmdb.js';
import { PetQueryDatabaseMariadb } from '#petquery/database/mariadb.js';
import { PetQueryDatabaseMongodb } from '#petquery/database/mongodb.js';
import { PetQueryDatabasePostgresql } from '#petquery/database/postgresql.js';
import { PetQueryDatabaseRedis } from '#petquery/database/redis.js';
import { PetQueryDatabaseSqlite } from '#petquery/database/sqlite.js';
import { PetQueryIp } from '#petquery/ip.js';
import { PetQueryLog } from '#petquery/log.js';
import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';
import { PetQueryTypes } from '#petquery/types.js';
import { PetQueryAssert } from '#petquery/assert.js';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { resolve } from 'node:path';
import fileUpload from 'express-fileupload';

import type { PetQueryLogConfig } from '#petquery/log.js';
import type { PetQueryPluginConfig } from '#petquery/plugin.js';
import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';
import type { ServerOptions } from 'node:https';

export type PetQueryConfigServerType = {
	gid:uuid_t;
	api:{endpoint:uri_t};
	adminContact:utf8_t;
	companyAddress:utf8_t;
	http:{
		host:utf8_t;
		port:port_t;
		enabled:bool_t;
		trusted_proxies:Array<utf8_t>;
	};
	https:{
		host:utf8_t;
		port:port_t;
		enabled:bool_t;
		certificate:ServerOptions;
	};
	authenticate:{
		mode:utf8_t;
		providers:Array<utf8_t>;
		plugin_options:Record<utf8_t,json_t>;
		session:{
			cookie_name:utf8_t;
			max_age:milliseconds_t;
			secure:bool_t;
		};
		lmdb:{
			users_name:utf8_t;
			sessions_name:utf8_t;
		};
		ldap:{
			url:uri_t;
			bind_dn:utf8_t;
			bind_password:utf8_t;
			base_dn:utf8_t;
			user_filter:utf8_t;
			admin_group:utf8_t;
		};
		oidc:{
			issuer:uri_t;
			client_id:utf8_t;
			client_secret:utf8_t;
			redirect_uri:uri_t;
			scopes:utf8_t;
			admin_group:utf8_t;
		};
	};
	file:{
		upload:{
			enabled:bool_t;
			max_file_size:uint_t;
			options:fileUpload.Options;
		};
	};
	logging:PetQueryLogConfig;
	max_results_per_module:uint_t;
	max_results_total:uint_t;
	index:{
		sync:{
			enabled:bool_t;
			interval:milliseconds_t;
			timeout:milliseconds_t;
			max_servers:uint_t;
		};
	};
	database:PetQueryDatabase;
	route:{
		api:{
			plugins:Set<utf8_t>;
			enabled:bool_t;
		};
	};
};

export type PetQueryConfigType = {
	server:PetQueryConfigServerType;
	plugin:Map<string,PetQueryPluginConfig>;
};

const configSchema = PetQuerySchemaServerDatabaseConfigEntry.getSchema();

type PetQueryConfigFileType =
	PetQuerySchemaStatic<typeof configSchema>;

const configValidator = PetQuerySchema.compile(configSchema);

function _createDatabase(
	config:PetQueryConfigFileType['database'],
	configDirectory:filename_t,
	aiSearchPath:filename_t
):PetQueryDatabase{
	if('postgresql' === config.type){
		return new PetQueryDatabaseEx(
			new PetQueryDatabasePostgresql(
				config,
				aiSearchPath
			)
		);
	}
	if('mariadb' === config.type){
		return new PetQueryDatabaseEx(
			new PetQueryDatabaseMariadb(config,aiSearchPath)
		);
	}
	if('mongodb' === config.type){
		return new PetQueryDatabaseEx(
			new PetQueryDatabaseMongodb(config,aiSearchPath)
		);
	}
	if('redis' === config.type){
		return new PetQueryDatabaseEx(
			new PetQueryDatabaseRedis(config,aiSearchPath)
		);
	}
	if('sqlite' === config.type){
		return new PetQueryDatabaseEx(
			new PetQueryDatabaseSqlite(
				{
					type:'sqlite',
					path:resolve(configDirectory,config.path)
				},
				aiSearchPath
			)
		);
	}
	if('lmdb' === config.type){
		return new PetQueryDatabaseLmdb(
			config,
			configDirectory,
			aiSearchPath
		);
	}
	throw new Error('Unsupported database type');
}



export class PetQueryConfig{
	protected static _configPath:path_t|null = null;
	protected static _json:PetQuerySchemaServerDatabaseConfigEntryType|null = null;
	protected static _settings:PetQueryConfigType|undefined;

	private constructor(){}

	static async loadFromFile(
		configPath:path_t
	):Promise<void>{
		const absolutePath = resolve(configPath);
		this._configPath = absolutePath;
		const text = await readFile(absolutePath,'utf8');
		let json:json_t;
		try{
			json = JSON.parse(text);
			this._json = PetQuerySchemaServerDatabaseConfigEntry.fromJson(json);
		}
		catch(error){
			throw new Error(`Invalid JSON configuration "${absolutePath}"`,{
				cause:error
			});
		}
		const parsed = PetQuerySchema.parse(configValidator,json);
		const server = this._createServerConfig(
			parsed,
			dirname(absolutePath)
		);
		this._settings = {
			server,
			plugin:new Map()
		};
	}

	static getLoadedJson():PetQuerySchemaServerDatabaseConfigEntryType{
		PetQueryAssert.notNull(this._json,'JSON server config not loaded');
		return this._json;
	}

	static getServerConfig():PetQueryConfigServerType{
		if(undefined === this._settings){
			throw new Error('Load a JSON server config before use');
		}
		return this._settings.server;
	}

	static getPluginConfig<T extends object>(
		obj:ConstructorType<T>,
		name:string
	):T{
		const config = this._getSettings().plugin.get(name);
		if(undefined === config || !PetQueryTypes.isInstanceOf<T>(obj,config)){
			throw new Error(`Unknown plugin "${name}"`);
		}
		return config;
	}

	static isPluginEnabled(name:string):boolean{
		return this._getSettings().plugin.get(name)?.isEnabled() === true;
	}

	static getPluginNames():Array<utf8_t>{
		return Array.from(this._getSettings().plugin.keys());
	}

	protected static _getSettings():PetQueryConfigType{
		if(undefined === this._settings){
			throw new Error('Load a JSON server config before use');
		}
		return this._settings;
	}

	protected static _createServerConfig(
		config:PetQueryConfigFileType,
		configDirectory:filename_t
	):PetQueryConfigServerType{
		const certificate:ServerOptions = {};
		if('' !== config.https.certificate.key){
			certificate.key = config.https.certificate.key;
		}
		if('' !== config.https.certificate.cert){
			certificate.cert = config.https.certificate.cert;
		}
		const uploadOptions:fileUpload.Options = {
			abortOnLimit:true,
			useTempFiles:false
		};
		const trustedProxies = PetQueryIp.validateTrustedProxies(
			config.http.trusted_proxies
		);
		const aiSearchPath = resolve(
			configDirectory,
			config.ai_search_path
		);
		const logging:PetQueryLogConfig = {
			level:config.logging.level,
			request:{
				enabled:config.logging.request.enabled
			},
			file:{
				path:resolve(
					configDirectory,
					config.logging.file.path
				),
				max_size:config.logging.file.max_size,
				max_files:config.logging.file.max_files
			}
		};
		PetQueryLog._initialize(logging);

		return {
			gid:config.gid,
			api:config.api,
			adminContact:config.adminContact,
			companyAddress:config.companyAddress,
			http:{
				host:config.http.host,
				port:config.http.port,
				enabled:config.http.enabled,
				trusted_proxies:trustedProxies
			},
			https:{
				host:config.https.host,
				port:config.https.port,
				enabled:config.https.enabled,
				certificate
			},
			authenticate:{
				mode:config.authenticate.mode,
				providers:config.authenticate.providers,
				plugin_options:config.authenticate.plugin_options,
				session:config.authenticate.session,
				lmdb:config.authenticate.lmdb,
				ldap:config.authenticate.ldap,
				oidc:config.authenticate.oidc
			},
			file:{
				upload:{
					enabled:config.file.upload.enabled,
					max_file_size:config.file.upload.max_file_size,
					options:uploadOptions
				}
			},
			logging,
			max_results_per_module:config.max_results_per_module,
			max_results_total:config.max_results_total,
			index:config.index,
			database:_createDatabase(
				config.database,
				configDirectory,
				aiSearchPath
			),
			route:{
				api:{
					plugins:new Set(config.route.api.plugins),
					enabled:config.route.api.enabled
				}
			}
		};
	}
};
