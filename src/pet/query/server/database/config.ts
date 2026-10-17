/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchemaServerDatabaseConfigEntryType } from "#schema/server/database/config/entry.js";

export interface PetQueryServerDatabaseConfig{
	serverConfigSave(serverUid:uuid_t,value:PetQuerySchemaServerDatabaseConfigEntryType):Promise<void>;
	
	serverConfigLoad(serverUid:uuid_t):Promise<PetQuerySchemaServerDatabaseConfigEntryType>;
};