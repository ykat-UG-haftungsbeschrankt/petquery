/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetQuerySchemaServerDatabaseSessionEntryType } from "#schema/server/database/session/entry.js";

export interface PetQueryServerDatabaseSession{
	serverSessionGet(sessionId:utf8_t):Promise<PetQuerySchemaServerDatabaseSessionEntryType>;
	serverSessionAdd(value:PetQuerySchemaServerDatabaseSessionEntryType):Promise<void>;
	serverSessionRemove(sessionId:utf8_t):Promise<void>;
	serverSessionDeleteExpired():Promise<void>;
};