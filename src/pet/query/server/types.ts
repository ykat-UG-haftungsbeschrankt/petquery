/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import type {PetQueryPluginQuery} from '#petquery/plugin/query.js';

export type PetQueryServerRequest = Express.Request & {
	petQueryPluginQuery?:PetQueryPluginQuery;
};
export type PetQueryServerResponse = Express.Response;
export type PetQueryServerNext = ()=>void;
export type PetQueryServerHandler = (
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:PetQueryServerNext
)=>void|Promise<void>;
