/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export interface PetQueryServerDatabaseAuth{
	serverAuthGet(key:utf8_t):Promise<utf8_t|undefined>;

	serverAuthPut(key:utf8_t,value:utf8_t):Promise<void>;

	serverAuthRemove(key:utf8_t):Promise<void>;

	serverAuthGetEntries():Promise<Map<utf8_t,utf8_t>>;
};