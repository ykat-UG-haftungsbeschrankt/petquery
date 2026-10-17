/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuery3pPluginMongodbConfig} from
	'#petquery/3p/plugin/mongodb/config.js';
import { PetQueryTypes } from './types.js';
import type {PetQueryServerRequest} from
	'#petquery/server/request.js';
import type {PetQueryServerResponse} from
	'#petquery/server/response.js';
import {PetQuery3pPluginPetqueryConfig} from
	'#petquery/3p/plugin/petquery/config.js';
import {PetQuery3pPluginMysqlConfig} from
	'#petquery/3p/plugin/mysql/config.js';
import {PetQuery3pPluginErrorConfig} from
	'#petquery/3p/plugin/error/config.js';
import {PetQuery3pPluginTestConfig} from
	'#petquery/3p/plugin/test/config.js';
import {PetQuery3pPluginAnimalidConfig} from
	'#petquery/3p/plugin/animalid/config.js';
import fileUpload from 'express-fileupload';
import type {ServerOptions} from 'node:https';
import type {PetQueryPluginConfig} from '#petquery/plugin.js';

export type PetQueryConfigAuthMode =
	'bearer'|'lmdb'|'ldap'|'oidc';

export type PetQueryConfigAuthenticate = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:()=>void
)=>void;

export type PetQueryConfigServerType = {
		http:{
			port:port_t;
			enabled:bool_t;
		};
		https:{
			port:port_t;
			enabled:bool_t;
			certificate:ServerOptions;
		};
		authenticate:{
			mode:PetQueryConfigAuthMode;
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
			database:PetQueryDatabaseLmdb;
			sync:{
				enabled:bool_t;
				interval:milliseconds_t;
				timeout:milliseconds_t;
				max_servers:uint_t;
			};
		};
		settings:{
			database:PetQueryDatabaseLmdb;
		};
		route:{
			api:{
				plugins:Set<utf8_t>;
				enabled:bool_t;
				authenticate:PetQueryConfigAuthenticate;
			};
			json:{
				enabled:bool_t;
				authenticate:PetQueryConfigAuthenticate;
			};
			'/':{
				enabled:bool_t;
			};
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

function authenticate(
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:()=>void
):void{
	const str = String(req.headers?.authorization).split(' ')[1];
	if(!settings.server.authenticate.bearer.has(str)){
		res.status(403).end();
	}else{
		next();
	}
}

const settings:PetQueryConfigType = {
	server:{
		 http:{
			port:50000 as port_t
			,enabled:true
		}
		,https:{
			port:50000 as port_t
			,enabled:false
			,certificate:{
				// cert:fs.readFileSync("/etc/letsencrypt//fullchain.pem")
				//,key:fs.readFileSync("/etc/letsencrypt//privkey.pem")
			}
		}
		,authenticate:{
			 mode:'bearer' as PetQueryConfigAuthMode
			,bearer:new Set<string>([
				 '75258ce9e0a7e751ce4e78cf20dd3f8f'
				,'c815512c071af26c864e6af29c2e2080'
				,'7b6795176a5b09bd80c4ec5ea6f7da6e'
				,'6d2d50aadc7004131b2992c9df88b1cf'
				,'764986b1436c3cf81054393ccd666e52'
				,'11030192d336705d43196b118eed1eac'
				,'c7c9cb95cbd6b3153955bdd75481a352'
				,'808d11ed47ec3e9823f0f3fed1ff6978'
				,'99a7f89c23149355077b0e07e6ee4ac8'
				,'f3dea1c3d8cd3faab10750fc96b2a5da'
			])
			,session:{
				 cookie_name:'petquery_session' as utf8_t
				,max_age:8 * 60 * 60 * 1000 as milliseconds_t
				,secure:false
			}
			,lmdb:{
				 users_name:'users' as utf8_t
				,sessions_name:'sessions' as utf8_t
			}
			,ldap:{
				 url:'' as uri_t
				,bind_dn:'' as utf8_t
				,bind_password:'' as utf8_t
				,base_dn:'' as utf8_t
				,user_filter:'(uid={{username}})' as utf8_t
				,admin_group:'admin' as utf8_t
			}
			,oidc:{
				 issuer:'' as uri_t
				,client_id:'' as utf8_t
				,client_secret:'' as utf8_t
				,redirect_uri:'' as uri_t
				,scopes:'openid profile email groups' as utf8_t
				,admin_group:'admin' as utf8_t
			}
		}
		,file:{
			upload:{
				 enabled:true
				,max_file_size:10 * 1024 * 1024 as uint_t // 10 MB
				,options:{
					abortOnLimit:true,
					useTempFiles:false
				} as fileUpload.Options
			}
		}
		,max_results_per_module:10 as uint_t
		,max_results_total:1000 as uint_t
		,index:{
			database:new PetQueryDatabaseLmdb({
				// LMDB environment directory, relative to the
				// working directory.
				 path:'var/lmdb' as filename_t
				,name:'servers' as utf8_t
				// Database in the same environment holding this
				// server's UUID.
				,settings_name:'settings' as utf8_t
			})
			,sync:{
				 enabled:true
				,interval:15 * 60 * 1000 as milliseconds_t
				// Timeout of each request to a peer.
				,timeout:5000 as milliseconds_t
				// Maximum number of entries read from a peer's list.
				,max_servers:1000 as uint_t
			}
		}
		,settings:{
			database:new PetQueryDatabaseLmdb({
				 path:'var/lmdb' as filename_t
				,name:'pets' as utf8_t
			})
		}
		,route:{
			api:{
				 plugins:new Set<string>(['test'])
				,enabled:true
				,authenticate:authenticate
			}
			,json:{
				enabled:true
				,authenticate:authenticate
			}
			,"/":{
				enabled:true
			}
			,gui:{
				 enabled:true
				// Build output of gui/, relative to the working directory.
				,path:'dist/gui' as filename_t
			}
		}
	}
	,plugin:new Map<string,PetQueryPluginConfig>([
		["animalid.by",new PetQuery3pPluginAnimalidConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					 favicon:'https://animalid.by/favicon.ico'
					,url:'https://animalid.by'
					,name:'Animalid'
				}
			}
		)]
		/*,["europetnet.org",new PetQueryPluginEuropetnetOrgConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					 favicon:'https://europetnet.org/favicon.ico'
					,url:'https://europetnet.org'
					,name:'Europetnet'
				}
			}
		)]*/
		,["test",new PetQuery3pPluginTestConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					favicon:'',
					url:'',
					name:'test'
				}
			}
			,{
				ain:'1234'
			}
		)]
		,["error",new PetQuery3pPluginErrorConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					favicon:'',
					url:'',
					name:'test'
				}
			}
		)]
		,["mongodb",new PetQuery3pPluginMongodbConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					favicon:'',
					url:'',
					name:'test'
				}
			}
			,{
				uri:'mongodb://localhost:27017',
				db:'test',
				collection:'test'
			}
		)]
		,["mysql",new PetQuery3pPluginMysqlConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					favicon:'',
					url:'',
					name:'test'
				}
			}
			,{
				  dbCfg: {}
				 ,query: ''
			}
		)]
		,["petquery",new PetQuery3pPluginPetqueryConfig(
			{
				enabled:false,
				timeout:5000,
				source:{
					favicon:'',
					url:'',
					name:'test'
				}
			}
			,{
				uri: '',
				headers: {
					'Authorization': ''
				}
			}
		)]
	])
};

export type PetQueryConfigPluginType = Map<string,PetQueryPluginConfig>;

export class PetQueryConfig{
	static getServerConfig(){
		return settings.server;
	}

	static getPluginConfig<T extends object>(obj:ConstructorType<T>,name:string):T{
		const config = settings.plugin.get(name);
		if(undefined === config
		|| !PetQueryTypes.isInstanceOf<T>(obj,config)){
			throw new Error(`Unknown plugin "${name}"`);
		}
		return config;
	}

	static isPluginEnabled(name:string):boolean{
		return settings.plugin.get(name)?.isEnabled() === true;
	}

	static getPluginNames():Array<utf8_t>{
		return Array.from(settings.plugin.keys());
	}
	destructor():void{
	}
};