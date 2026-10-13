/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryPluginQueryFile} from
	'#petquery/plugin/query/file.js';
import type {PetQueryResultDataEntry} from
	'#petquery/result/data/entry.js';

export type PetQueryServerFile = PetQueryPluginQueryFile;

export interface PetQueryServerDatabaseSearch{
	search(query:utf8_t):Promise<Array<PetQueryResultDataEntry>>;

	searchByFile(
		files:Array<PetQueryServerFile>
	):Promise<Array<PetQueryResultDataEntry>>;
};
