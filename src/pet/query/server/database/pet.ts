/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';

export abstract class PetQueryServerDatabasePet extends PetQueryDestructor{
	abstract serverPetAdd(value:PetQuerySchemaServerDatabasePetEntryType):Promise<void>;
	abstract serverPetGet(key:utf8_t):Promise<PetQuerySchemaServerDatabasePetEntryType>;
	abstract serverPetRemove(key:utf8_t):Promise<void>;
	abstract serverPetGetEntries():Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
	abstract serverPetSearch(query:utf8_t):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
	/*
	abstract serverPetSearchByFile(
		files:Array<PetQueryServerFile>
	):Promise<Array<PetQuerySchemaServerDatabasePetEntryType>>;
*/
};
