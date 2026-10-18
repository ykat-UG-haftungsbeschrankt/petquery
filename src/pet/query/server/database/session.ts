/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQuerySchemaServerDatabaseSessionEntryType } from '#schema/server/database/session/entry.js';

export abstract class PetQueryServerDatabaseSession extends PetQueryDestructor{
	abstract serverSessionGet(
		sessionId:utf8_t
	):Promise<PetQuerySchemaServerDatabaseSessionEntryType|undefined>;
	abstract serverSessionAdd(
		value:PetQuerySchemaServerDatabaseSessionEntryType
	):Promise<void>;
	abstract serverSessionGetEntries():Promise<
		Array<PetQuerySchemaServerDatabaseSessionEntryType>
	>;
	abstract serverSessionRemove(sessionId:utf8_t):Promise<void>;
	abstract serverSessionDeleteExpired():Promise<void>;
};