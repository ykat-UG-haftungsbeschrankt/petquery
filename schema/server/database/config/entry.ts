/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaAbstract } from '#petquery/schema.js';
import { PetQuerySchemaTypeLogLevel } from '#schema/type/log/level.js';

import type { PetQuerySchemaProperties } from '#petquery/schema.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;
// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

// Object that rejects unknown keys.
function strict<P extends PetQuerySchemaProperties>(properties:P){
	return T.Object(properties,{additionalProperties:false});
}

const schema = strict({
	 gid:T.String({format:'uuid'})
	,api:strict({
		endpoint:T.String({format:'uri'})
	})
	,adminContact:T.String({maxLength:1024})
	,companyAddress:T.String({maxLength:4096})
	,http:strict({
		host:T.String({minLength:1,maxLength:255}),
		port:T.Integer({minimum:1,maximum:65535})
		,enabled:T.Boolean()
		,trusted_proxies:T.Array(
			T.String({minLength:1,maxLength:64}),
			{maxItems:64,uniqueItems:true}
		)
	})
	,https:strict({
		host:T.String({minLength:1,maxLength:255}),
		port:T.Integer({minimum:1,maximum:65535}),
		enabled:T.Boolean(),
		certificate:strict({
			key:T.String(),
			cert:T.String()
		})
	})
	,authenticate:strict({
		mode:T.String({minLength:1})
		,providers:T.Array(
			T.String({minLength:1}),
			{minItems:1,maxItems:1000}
		)
		,plugin_options:T.Record(
			T.String({minLength:1}),
			T.Any()
		)
		,session:strict({
			 cookie_name:T.String({
				pattern:'^[A-Za-z0-9._-]{1,64}$'
			})
			,max_age:T.Integer({minimum:60000,maximum:MAX_TIMER_MS})
			,secure:T.Boolean()
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
			 enabled:T.Boolean()
			,max_file_size:T.Integer({
				minimum:1,
				maximum:1073741824
			})
		})
	})
	,max_results_per_module:T.Integer({minimum:1,maximum:1000000})
	,max_results_total:T.Integer({minimum:1,maximum:1000000})
	,index:strict({
		sync:strict({
			 enabled:T.Boolean()
			,interval:T.Integer({minimum:1000,maximum:MAX_TIMER_MS})
			,timeout:T.Integer({minimum:100,maximum:MAX_TIMER_MS})
			,max_servers:T.Integer({minimum:1,maximum:1000000})
		})
	})
	,logging:strict({
		level:PetQuerySchemaTypeLogLevel,
		request:strict({
			enabled:T.Boolean()
		}),
		file:strict({
			path:T.String({minLength:1,maxLength:4096}),
			max_size:T.Integer({
				minimum:1024,
				maximum:10485760
			}),
			max_files:T.Integer({
				minimum:2,
				maximum:5
			})
		})
	})
	,database:T.Union([
		strict({
			type:T.Literal('postgresql'),
			connectionString:T.String({minLength:1})
		}),
		strict({
			type:T.Literal('lmdb'),
			path:T.String({minLength:1})
		}),
		strict({
			type:T.Literal('mariadb'),
			connectionString:T.String({minLength:1})
		}),
		strict({
			type:T.Literal('mongodb'),
			connectionString:T.String({minLength:1}),
			database:T.String({minLength:1,maxLength:64})
		}),
		strict({
			type:T.Literal('redis'),
			connectionString:T.String({minLength:1})
		}),
		strict({
			type:T.Literal('sqlite'),
			path:T.String({minLength:1})
		})
	])
	,ai_search_path:T.String({minLength:1})
	,route:strict({
		 api:strict({
			 enabled:T.Boolean()
			,plugins:T.Array(T.String({minLength:1}),{maxItems:1000})
		})
	})
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaServerDatabaseConfigEntryType =
	PetQuerySchemaStatic<typeof schema>;

// Successful response of GET /api/ping/get. Errors are sent as
// PetQueryServerResponseSchemaError.
class PetQuerySchemaServerDatabaseConfigEntry extends PetQuerySchemaAbstract<
	PetQuerySchemaServerDatabaseConfigEntryType
>{
	protected static _instance: PetQuerySchemaServerDatabaseConfigEntry | null = null;
	public static getInstance():PetQuerySchemaServerDatabaseConfigEntry{
		if(this._instance === null){
			this._instance = new PetQuerySchemaServerDatabaseConfigEntry();
		}
		return this._instance;
	}
	getSchema(){
		return schema;
	}
	getValidator(){
		return validator;
	}
};

const petQuerySchemaServerDatabaseConfigEntry = PetQuerySchemaServerDatabaseConfigEntry.getInstance();

export { petQuerySchemaServerDatabaseConfigEntry as PetQuerySchemaServerDatabaseConfigEntry };