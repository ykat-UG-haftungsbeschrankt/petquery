/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchemaServerDatabaseIndexEntryType } from "#schema/server/database/index/entry.js";

export interface PetQueryServerDatabaseIndex{
	serverIndexAddServer(value:PetQuerySchemaServerDatabaseIndexEntryType):Promise<void>;
	serverIndexGetServer(key:utf8_t):Promise<PetQuerySchemaServerDatabaseIndexEntryType>;

	serverIndexRemoveServer(key:utf8_t):Promise<void>;

	serverIndexGetServerList():Promise<Array<PetQuerySchemaServerDatabaseIndexEntryType>>;

	serverIndexSetServerUid(uid:uuid_t):Promise<void>;
	serverIndexGetServerUid():Promise<uuid_t>;
};