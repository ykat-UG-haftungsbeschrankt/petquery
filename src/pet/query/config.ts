/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDatabaseAuthLmdb } from '#petquery/database/auth/lmdb.js';
import { PetQueryDatabaseConfigLmdb } from '#petquery/database/config/lmdb.js';
import { PetQueryDatabaseIndexLmdb } from '#petquery/database/index/lmdb.js';
import { PetQueryDatabasePetLmdb } from '#petquery/database/pet/lmdb.js';
import { PetQueryDatabasePostgresql } from '#petquery/database/postgresql.js';
import { PetQueryDatabaseSessionLmdb } from '#petquery/database/session/lmdb.js';
import { PetQueryDatabase } from '#petquery/database.js';
import { PetQueryDatabaseEx } from '#petquery/database.js';
import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryTypes } from '#petquery/types.js';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { resolve } from 'node:path';
import fileUpload from 'express-fileupload';

import type { PetQueryPluginConfig } from '#petquery/plugin.js';
import type { PetQueryServerRequest } from '#petquery/server/request.js';
import type { PetQueryServerResponse } from '#petquery/server/response.js';
import type { PetQuerySchemaDatabaseConfigLmdbType } from '#schema/database/config/lmdb.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';
import type { ServerOptions } from 'node:https';

export type PetQueryConfigAuthenticate = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:()=>void
)=>void;

export type PetQueryConfigServerType = {
	api:{endpoint:uri_t};
	http:{
		host:utf8_t;
		port:port_t;
		enabled:bool_t;
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
		bearer:Set<utf8_t>;
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
			authenticate:PetQueryConfigAuthenticate;
		};
		'/':{enabled:bool_t};
		gui:{
			enabled:bool_t;
			path:filename_t;
		};
	};
};

export type PetQueryConfigType = {
	server:PetQueryConfigServerType;
	plugin:Map<string,PetQueryPluginConfig>;
};

const T = PetQuerySchema.type;
const bearerValidator = PetQuerySchema.compile(
	T.String({pattern:'^[\\x21-\\x7e]{16,256}$'})
);
const configSchema = T.Object({
	api:T.Object({
		endpoint:T.String({format:'uri'})
	},{additionalProperties:false}),
	http:T.Object({
		host:T.Optional(T.String({minLength:1,maxLength:255})),
		port:T.Integer({minimum:1,maximum:65535}),
		enabled:T.Boolean()
	},{additionalProperties:false}),
	https:T.Object({
		host:T.Optional(T.String({minLength:1,maxLength:255})),
		port:T.Integer({minimum:1,maximum:65535}),
		enabled:T.Boolean(),
		certificate:T.Object({
			key:T.Optional(T.String()),
			cert:T.Optional(T.String())
		},{additionalProperties:false})
	},{additionalProperties:false}),
	authenticate:T.Object({
		mode:T.String({minLength:1}),
		providers:T.Array(T.String({minLength:1}),{minItems:1}),
		plugin_options:T.Record(T.String(),T.Any()),
		bearer:T.Optional(T.Array(
			T.String({pattern:'^[\\x21-\\x7e]{16,256}$'}),
			{minItems:1,maxItems:100}
		)),
		bearer_env:T.Optional(T.String({
			pattern:'^[A-Za-z_][A-Za-z0-9_]*$'
		})),
		session:T.Object({
			cookie_name:T.String({
				pattern:'^[A-Za-z0-9._-]{1,64}$'
			}),
			max_age:T.Integer({minimum:60000,maximum:2147483647}),
			secure:T.Boolean()
		},{additionalProperties:false}),
		lmdb:T.Object({
			users_name:T.String({minLength:1,maxLength:128}),
			sessions_name:T.String({minLength:1,maxLength:128})
		},{additionalProperties:false}),
		ldap:T.Object({
			url:T.String({maxLength:4096}),
			bind_dn:T.String({maxLength:4096}),
			bind_password:T.String({maxLength:4096}),
			base_dn:T.String({maxLength:4096}),
			user_filter:T.String({maxLength:4096}),
			admin_group:T.String({maxLength:1024})
		},{additionalProperties:false}),
		oidc:T.Object({
			issuer:T.String({maxLength:4096}),
			client_id:T.String({maxLength:1024}),
			client_secret:T.String({maxLength:4096}),
			redirect_uri:T.String({maxLength:4096}),
			scopes:T.String({maxLength:1024}),
			admin_group:T.String({maxLength:1024})
		},{additionalProperties:false})
	},{additionalProperties:false}),
	file:T.Object({
		upload:T.Object({
			enabled:T.Boolean(),
			max_file_size:T.Integer({
				minimum:1,
				maximum:1073741824
			})
		},{additionalProperties:false})
	},{additionalProperties:false}),
	max_results_per_module:T.Integer({minimum:1,maximum:1000000}),
	max_results_total:T.Integer({minimum:1,maximum:1000000}),
	index:T.Object({
		sync:T.Object({
			enabled:T.Boolean(),
			interval:T.Integer({minimum:1000,maximum:2147483647}),
			timeout:T.Integer({minimum:100,maximum:2147483647}),
			max_servers:T.Integer({minimum:1,maximum:1000000})
		},{additionalProperties:false})
	},{additionalProperties:false}),
	database:T.Union([
		T.Object({
			type:T.Literal('postgresql'),
			connectionString:T.String({minLength:1})
		},{additionalProperties:false}),
		T.Object({
			type:T.Literal('lmdb'),
			path:T.String({minLength:1})
		},{additionalProperties:false})
	]),
	ai_search_path:T.String({minLength:1}),
	route:T.Object({
		api:T.Object({
			plugins:T.Array(T.String({minLength:1}),{maxItems:1000}),
			enabled:T.Boolean()
		},{additionalProperties:false}),
		'/':T.Object({
			enabled:T.Boolean()
		},{additionalProperties:false}),
		gui:T.Object({
			enabled:T.Boolean(),
			path:T.String({minLength:1})
		},{additionalProperties:false})
	},{additionalProperties:false})
},{additionalProperties:false});

type PetQueryConfigFileType =
	PetQuerySchemaStatic<typeof configSchema>;

const configValidator = PetQuerySchema.compile(configSchema);

function _createAuthenticate(
	bearer:Set<utf8_t>
):PetQueryConfigAuthenticate{
	return (
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:()=>void
	):void=>{
		const value = req.headers.authorization;
		const parts = 'string' === typeof value ? value.split(' ') : [];
		const token = 2 === parts.length
			&& 'bearer' === parts[0]?.toLowerCase()
			? parts[1]
			: undefined;
		if(undefined === token || !bearer.has(token)){
			res.sendAuthUnauthorizedError('Invalid bearer token');
			return;
		}
		next();
	};
}

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

	const path = resolve(configDirectory,config.path);
	const makeConfig = (
		name:utf8_t
	):PetQuerySchemaDatabaseConfigLmdbType=>{
		return {type:'lmdb',path,name};
	};
	return new PetQueryDatabase({
		dbAuth:new PetQueryDatabaseAuthLmdb(makeConfig('auth')),
		dbConfig:new PetQueryDatabaseConfigLmdb(makeConfig('config')),
		dbIndex:new PetQueryDatabaseIndexLmdb(makeConfig('index')),
		dbPet:new PetQueryDatabasePetLmdb(
			makeConfig('pet'),
			aiSearchPath
		),
		dbSession:new PetQueryDatabaseSessionLmdb(makeConfig('session'))
	});
}

function _createServerConfig(
	config:PetQueryConfigFileType,
	configDirectory:filename_t
):PetQueryConfigServerType{
	const bearer = new Set<utf8_t>();
	const literalBearer = config.authenticate.bearer;
	const bearerEnv = config.authenticate.bearer_env;
	if(undefined !== literalBearer && undefined !== bearerEnv){
		throw new Error(
			'Configure either authenticate.bearer or authenticate.bearer_env'
		);
	}
	if(undefined === literalBearer && undefined === bearerEnv){
		throw new Error(
			'Configure authenticate.bearer or authenticate.bearer_env'
		);
	}
	if(undefined !== literalBearer){
		for(const token of literalBearer){
			bearer.add(token);
		}
	}else{
		const token = undefined === bearerEnv
			? undefined
			: process.env[bearerEnv];
		if(undefined === token){
			throw new Error(
				`Environment variable "${bearerEnv}" is not set`
			);
		}
		bearer.add(PetQuerySchema.parse(bearerValidator,token));
	}

	const certificate:ServerOptions = {};
	if(undefined !== config.https.certificate.key){
		certificate.key = config.https.certificate.key;
	}
	if(undefined !== config.https.certificate.cert){
		certificate.cert = config.https.certificate.cert;
	}
	const uploadOptions:fileUpload.Options = {
		abortOnLimit:true,
		useTempFiles:false
	};
	const aiSearchPath = resolve(
		configDirectory,
		config.ai_search_path
	);

	return {
		api:config.api,
		http:{
			host:config.http.host ?? '0.0.0.0',
			port:config.http.port,
			enabled:config.http.enabled
		},
		https:{
			host:config.https.host ?? '0.0.0.0',
			port:config.https.port,
			enabled:config.https.enabled,
			certificate
		},
		authenticate:{
			mode:config.authenticate.mode,
			providers:config.authenticate.providers,
			plugin_options:config.authenticate.plugin_options,
			bearer,
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
				enabled:config.route.api.enabled,
				authenticate:_createAuthenticate(bearer)
			},
			'/':config.route['/'],
			gui:{
				enabled:config.route.gui.enabled,
				path:resolve(configDirectory,config.route.gui.path)
			}
		}
	};
}

export class PetQueryConfig{
	protected static _settings:PetQueryConfigType|undefined;

	private constructor(){}

	static async loadFromCommandLine(
		args:readonly utf8_t[]
	):Promise<void>{
		let configPath:utf8_t|undefined;
		if(1 === args.length){
			configPath = args[0];
		}else if(2 === args.length && '--config' === args[0]){
			configPath = args[1];
		}
		if(undefined === configPath || '' === configPath){
			throw new Error(
				'Usage: node dist/index.js --config <server-config.json>'
			);
		}
		const absolutePath = resolve(configPath);
		const text = await readFile(absolutePath,'utf8');
		let json:unknown;
		try{
			json = JSON.parse(text);
		}
		catch(error){
			throw new Error(`Invalid JSON configuration "${absolutePath}"`,{
				cause:error
			});
		}
		const parsed = PetQuerySchema.parse(configValidator,json);
		const configDirectory = dirname(absolutePath);
		const server = _createServerConfig(parsed,configDirectory);
		this._settings = {
			server,
			plugin:new Map()
		};
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
};
