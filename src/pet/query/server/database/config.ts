/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export interface PetQueryServerDatabaseConfig{
	serverConfigSave(value:json_t):Promise<void>;
	
	serverConfigLoad():Promise<json_t|null>;
};