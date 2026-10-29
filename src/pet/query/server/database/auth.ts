/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

export abstract class PetQueryServerDatabaseAuth extends PetQueryDestructor{
	abstract serverAuthGet(key:utf8_t):Promise<utf8_t|undefined>;

	abstract serverAuthPut(key:utf8_t,value:utf8_t):Promise<void>;

	abstract serverAuthReplace(
		oldKey:utf8_t,
		newKey:utf8_t,
		value:utf8_t
	):Promise<void>;

	abstract serverAuthRemove(key:utf8_t):Promise<void>;

	abstract serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>;
};