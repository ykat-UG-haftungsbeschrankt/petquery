/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQuerySchemaServerDatabasePetEntryType } from "#schema/server/database/pet/entry.js";
//import type { PetQueryServerFile } from "#petquery/server/file.js";

export interface PetQueryServerDatabasePet{
	serverPetAdd(value:PetQuerySchemaServerDatabasePetEntryType):Promise<void>;
	serverPetGet(key:utf8_t):Promise<PetQuerySchemaServerDatabasePetEntryType>;
	serverPetRemove(key:utf8_t):Promise<void>;
	serverPetGetEntries():Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
	serverPetSearch(query:utf8_t):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
/*
	serverPetSearchByFile(
		files:Array<PetQueryServerFile>
	):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
*/
};
