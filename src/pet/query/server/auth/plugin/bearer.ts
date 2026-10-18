/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryDatabase} from '#petquery/database.js';
import type {PetQueryServerAuthUser} from '#petquery/server/auth.js';
import {PetQueryServerAuthPluginLmdb} from
	'#petquery/server/auth/plugin/lmdb.js';
import type {PetQueryServerRequest} from '#petquery/server/request.js';

export class PetQueryServerAuthPluginBearer
extends PetQueryServerAuthPluginLmdb{
	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase
	){
		super(config,database);
	}

	override getName():utf8_t{
		return 'bearer';
	}

	override getLoginType():'bearer'|'password'|'redirect'{
		return 'bearer';
	}

	override async authenticate(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser|null>{
		this._assertNotDestroyed();
		const header = req.headers.authorization;
		if('string' !== typeof header){
			return null;
		}
		const parts = header.split(' ');
		if(2 !== parts.length || 'bearer' !== parts[0].toLowerCase()
		|| !this._config.authenticate.bearer.has(parts[1])){
			return null;
		}
		return {
			username:'bearer',
			displayName:'******',
			group:'admin',
			provider:this.getName()
		};
	}

	override async login(
		req:PetQueryServerRequest
	):Promise<PetQueryServerAuthUser>{
		const user = await this.authenticate(req);
		this._assertNotDestroyed();
		if(null === user){
			throw new Error('Invalid bearer token');
		}
		return user;
	}
};
