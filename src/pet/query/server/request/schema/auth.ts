/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryServerRequestSchema } from '#petquery/server/request/schema.js';
import util from 'node:util';

import type { PetQueryServerResponse } from '#petquery/server/response.js';

export abstract class PetQueryServerRequestSchemaAuth<
	T_REQUEST,
	T_RESPONSE
> extends PetQueryServerRequestSchema<T_REQUEST,T_RESPONSE>{
	protected override _sendRequestError(
		res:PetQueryServerResponse,
		error:unknown
	):void{
		res.status(400);
		res.json({
			success:false,
			error:[
				error instanceof Error ? error.message : util.inspect(error)
			],
			data:null
		});
	}
};
