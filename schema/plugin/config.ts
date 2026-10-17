/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema, PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';
import { PetQuerySchemaPluginDataSource } from './data/source.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	 enabled:T.Boolean()
	,timeout:T.Number()
	,source:PetQuerySchemaPluginDataSource.getSchema()
},{
	 title:'GET /api/config/get Config'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaPluginConfigType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaPluginConfig extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaPluginConfigType
	>{
	protected static _instance:
		PetQuerySchemaPluginConfig | null = null;
	public static getInstance():PetQuerySchemaPluginConfig{
		if(this._instance === null){
			this._instance = new PetQuerySchemaPluginConfig();
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

const petQuerySchemaPluginConfig =
	PetQuerySchemaPluginConfig.getInstance();

export {
	petQuerySchemaPluginConfig as PetQuerySchemaPluginConfig
};




/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.


import type {PetQueryResultDataSource} from
	'#petquery/result/data/source.js';

export class PetQuerySchemaPluginConfig{
	private _enabled:boolean;
	private _timeout:milliseconds_t;
	private _source:PetQueryResultDataSource;
	constructor(obj:{
		 enabled:boolean
		,timeout:milliseconds_t
		,source:PetQueryResultDataSource
	}){
		this._enabled = obj.enabled;
		this._timeout = obj.timeout;
		this._source = obj.source;
	}
	isEnabled():boolean{
		return this._enabled !== false;
	}
	getTimeout():milliseconds_t{
		return this._timeout;
	}
	getSource():PetQueryResultDataSource{
		return this._source;
	}
	destructor():void{
	}
};
 */