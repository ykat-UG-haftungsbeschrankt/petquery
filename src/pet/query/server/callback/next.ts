/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {
	PetQueryServerNext,
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

// Pass-through used when a route has no authenticate callback.
export class PetQueryServerCallbackNext{
	static handle(
		UNUSED_req:PetQueryServerRequest,
		UNUSED_res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		next();
	}
};
