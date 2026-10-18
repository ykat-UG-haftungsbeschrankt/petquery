/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryClientError extends Error{
	readonly status:uint16_t;
	readonly errors:Array<utf8_t>;

	constructor(status:uint16_t,errors:Array<utf8_t>){
		super(`HTTP ${status}: ${errors.join('\n')}`);
		this.name = 'PetQueryClientError';
		this.status = status;
		this.errors = [...errors];
	}

	destructor():void{
	}
};
