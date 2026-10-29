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
	,api:T.Optional(strict({
		endpoint:T.String({format:'uri'})
	}))
	,adminContact:T.Optional(T.String({maxLength:1024}))
	,companyAddress:T.Optional(T.String({maxLength:4096}))
	,http:strict({
		host:T.Optional(T.String({minLength:1,maxLength:255})),
		port:T.Integer({minimum:1,maximum:65535})
		,enabled:T.Optional(T.Boolean())
		,trusted_proxies:T.Optional(T.Array(
			T.String({minLength:1,maxLength:64}),
			{maxItems:64,uniqueItems:true}
		))
	})
	,https:T.Optional(strict({
		host:T.Optional(T.String({minLength:1,maxLength:255})),
		port:T.Integer({minimum:1,maximum:65535}),
		enabled:T.Boolean(),
		certificate:strict({
			key:T.Optional(T.String()),
			cert:T.Optional(T.String())
		})
	}))
	,authenticate:strict({
		mode:T.String({minLength:1})
		,providers:T.Optional(T.Array(
			T.String({minLength:1}),
			{minItems:1,maxItems:1000}
		))
		,plugin_options:T.Optional(T.Record(
			T.String({minLength:1}),
			T.Any()
		))
		// Kept empty for compatibility with previously saved config records.
		,bearer:T.Optional(T.Array(
			T.String({pattern:'^[\\x21-\\x7e]{16,256}$'}),
			{minItems:0,maxItems:100}
		))
		,bearer_env:T.Optional(T.String({
			pattern:'^[A-Za-z_][A-Za-z0-9_]*$'
		}))
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
	,logging:T.Optional(strict({
		level:T.Optional(PetQuerySchemaTypeLogLevel),
		request:T.Optional(strict({
			enabled:T.Optional(T.Boolean())
		})),
		file:T.Optional(strict({
			path:T.Optional(T.String({minLength:1,maxLength:4096})),
			max_size:T.Optional(T.Integer({
				minimum:1024,
				maximum:10485760
			})),
			max_files:T.Optional(T.Integer({
				minimum:2,
				maximum:5
			}))
		}))
	}))
	,database:T.Optional(T.Union([
		strict({
			type:T.Literal('postgresql'),
			connectionString:T.String({minLength:1})
		}),
		strict({
			type:T.Literal('lmdb'),
			path:T.String({minLength:1})
		})
	]))
	,ai_search_path:T.Optional(T.String({minLength:1}))
	,route:strict({
		 api:strict({
			 enabled:T.Boolean()
			,plugins:T.Array(T.String({minLength:1}),{maxItems:1000})
		})
		,'/':strict({enabled:T.Boolean()})
		,gui:strict({
			enabled:T.Boolean(),
			path:T.Optional(T.String({minLength:1}))
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