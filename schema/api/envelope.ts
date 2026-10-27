/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchema } from '#petquery/schema.js';
import { PetQueryServerResponseSchema } from '#petquery/server/response/schema.js';

import type { PetQuerySchemaStatic } from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	success:T.Boolean(),
	error:T.Array(T.String()),
	data:T.Unknown()
},{
	title:'Envelope response of every route',
	additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaApiEnvelopeType =
	PetQuerySchemaStatic<typeof schema>;

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