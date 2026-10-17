/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema, PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	favicon:T.String(),
	url:T.String(),
	name:T.String()
},{
	 title:'GET /api/DataSource/get DataSource'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaPluginDataSourceType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/DataSource/get
class PetQuerySchemaPluginDataSource extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaPluginDataSourceType
	>{
	protected static _instance:
		PetQuerySchemaPluginDataSource | null = null;
	public static getInstance():PetQuerySchemaPluginDataSource{
		if(this._instance === null){
			this._instance = new PetQuerySchemaPluginDataSource();
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

const petQuerySchemaPluginDataSource =
	PetQuerySchemaPluginDataSource.getInstance();

export {
	petQuerySchemaPluginDataSource as PetQuerySchemaPluginDataSource
};
