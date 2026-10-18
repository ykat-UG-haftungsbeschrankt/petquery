/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQuerySchemaServerDatabaseIndexEntryType } from '#schema/server/database/index/entry.js';

export abstract class PetQueryServerDatabaseIndex extends PetQueryDestructor{
	abstract serverIndexGetServerUid():Promise<uuid_t>;
	abstract serverIndexSetServerUid(gid:uuid_t):Promise<void>;
	abstract serverIndexAddServer(value:PetQuerySchemaServerDatabaseIndexEntryType):Promise<void>;
	abstract serverIndexGetServer(key:utf8_t):Promise<PetQuerySchemaServerDatabaseIndexEntryType>;

	abstract serverIndexRemoveServer(key:utf8_t):Promise<void>;

	abstract serverIndexGetServerList():Promise<Array<PetQuerySchemaServerDatabaseIndexEntryType>>;
};