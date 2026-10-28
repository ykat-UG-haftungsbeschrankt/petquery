/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQuerySchemaTypeJson } from '#schema/type/json.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaCheck } from '#petquery/schema.js';
import type { PetQuerySchemaStatic } from '#petquery/schema.js';
import type { PetQuerySchemaTypeJsonType } from '#schema/type/json.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:PetQuerySchemaTypeJson
},{
	title:'Envelope response of every route',
	additionalProperties:false
});

const schemaValidator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiEnvelopeType =
	Omit<PetQuerySchemaStatic<typeof schema>,'data'> & {
		data:PetQuerySchemaTypeJsonType;
	};

const validator:PetQuerySchemaCheck<PetQuerySchemaApiEnvelopeType> = {
	Check(value):value is PetQuerySchemaApiEnvelopeType{
		return schemaValidator.Check(value);
	},
	Errors(value){
		return schemaValidator.Errors(value);
	}
};

class PetQuerySchemaApiEnvelope extends PetQueryServerResponseSchema<
	PetQuerySchemaApiEnvelopeType
>{
	protected static _instance: PetQuerySchemaApiEnvelope | null = null;
	public static getInstance():PetQuerySchemaApiEnvelope{
		if(this._instance === null){
			this._instance = new PetQuerySchemaApiEnvelope();
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

const petQuerySchemaApiEnvelope = PetQuerySchemaApiEnvelope.getInstance();

export { petQuerySchemaApiEnvelope as PetQuerySchemaApiEnvelope };