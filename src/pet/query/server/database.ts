/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Asynchronous UTF-8 key-value storage backend.
export abstract class PetQueryServerDatabase{
	abstract get(key:utf8_t):Promise<utf8_t|undefined>;

	// Stores the value, replacing any existing value for the key.
	abstract put(key:utf8_t,value:utf8_t):Promise<void>;

	// Removes the key; a missing key is a no-op.
	abstract remove(key:utf8_t):Promise<void>;

	// Returns an independent snapshot of all entries.
	abstract getEntries():Promise<Map<utf8_t,utf8_t>>;

	abstract destructor():Promise<void>;
};
