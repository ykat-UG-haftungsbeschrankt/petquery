/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';

export abstract class PetQueryServerDatabaseConfig extends PetQueryDestructor{
	abstract serverConfigSave(
		gid:uuid_t,
		value:PetQuerySchemaServerDatabaseConfigEntryType
	):Promise<void>;
	
	abstract serverConfigLoad(
		gid:uuid_t
	):Promise<PetQuerySchemaServerDatabaseConfigEntryType>;
};