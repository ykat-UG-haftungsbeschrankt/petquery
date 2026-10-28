/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryLog } from '#petquery/log.js';
import { PetQueryServerDatabaseSession } from '#petquery/server/database/session.js';
import { PetQueryTimer } from '#petquery/timer.js';

import type { PetQueryDatabase } from '#petquery/database.js';

export class PetQueryServerIndexSync extends PetQueryTimer{
	protected readonly _database:PetQueryServerDatabaseSession;

	constructor(
		database:PetQueryDatabase,
		interval:milliseconds_t
	){
		super(interval);
		this._database = database.getDbSession();
	}

	isInterrupted():boolean{
		return this._isDestroyed();
	}

	protected async _onCallback(){
		await this._database.serverSessionDeleteExpired();
	}

	protected _onError(error:unknown):void{
		PetQueryLog.getInstance().error(
			'Expired session cleanup failed',
			error
		);
	}
};