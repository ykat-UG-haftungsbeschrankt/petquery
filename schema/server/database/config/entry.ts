/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema} from '#petquery/schema.js';
import {PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaProperties, PetQuerySchemaStatic} from '#petquery/schema.js';

const T = PetQuerySchema.type;
// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

// Object that rejects unknown keys.
function strict<P extends PetQuerySchemaProperties>(properties:P){
	return T.Object(properties,{additionalProperties:false});
}

const schema = strict({
	 serverUid:T.String({pattern:'^[\\x21-\\x7e]{16,256}$'})
	,http:strict({
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
			,max_file_size:T.Integer({minimum:1})
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
	,route:strict({
		 api:strict({
			 enabled:T.Boolean()
			,plugins:T.Array(T.String({minLength:1}),{maxItems:1000})
		})
		,json:strict({enabled:T.Boolean()})
		,'/':strict({enabled:T.Boolean()})
		,gui:strict({enabled:T.Boolean()})
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