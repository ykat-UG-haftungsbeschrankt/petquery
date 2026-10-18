/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAbortController } from '#petquery/abort.js';
import { PetQuerySchemaApiPingGetRequest } from '#schema/api/ping/get/request.js';
import { PetQuerySchemaApiServerGetRequest } from '#schema/api/server/get/request.js';
import { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
import { PetQueryTimer } from '#petquery/timer.js';
import util from 'node:util';

import type { PetQueryDatabase } from '#petquery/database.js';

// Periodically fetches the server list of every known server and merges it
// into the index. A remote entry is added, or replaces a known URI, only
// when pinging its URI answers with the same UUID. The index is borrowed.
export class PetQueryServerIndexSync extends PetQueryTimer{
	protected readonly _database:PetQueryServerDatabaseIndex;
	protected readonly _uuid:uuid_t;
	protected readonly _timeout:milliseconds_t;
	protected readonly _maxServers:uint_t;
	protected readonly _abortController:PetQueryAbortController;

	// uuid is this server's own UUID; entries with it are never merged.
	constructor(
		database:PetQueryDatabase,
		uuid:uuid_t,
		interval:milliseconds_t,
		timeout:milliseconds_t,
		maxServers:uint_t
	){
		super(interval);
		this._database = database.getDbIndex();
		this._uuid = uuid;
		this._timeout = timeout;
		this._maxServers = maxServers;
		this._abortController = new PetQueryAbortController();
	}

	protected override async _destructor():Promise<void>{
		this._abortController.destructor();
		await super._destructor();
	}

	isInterrupted():boolean{
		return this._abortController.isAborted() || this._isDestroyed();
	}
	// Runs one sync pass. Failures of single servers are reported and
	// skipped; failures reading the local index reject.
	async _onCallback():Promise<void>{
		const visited = new Set<uuid_t>([this._uuid]);
		const servers = await this._database.serverIndexGetServerList();
		for(const server of servers){
			if(this.isInterrupted()){
				return;
			}
			if(visited.has(server.uid)){
				continue;
			}
			try{
				const remoteServerList = await PetQuerySchemaApiServerGetRequest.fetch(
					server.uri,
					{},
					this._abortController.getTimeoutSignal(this._timeout)
				);
				for(const remoteServer of remoteServerList){
					if(this.isInterrupted()){
						return;
					}
					if(visited.has(remoteServer.uid)){
						continue;
					}
					try{
						const data = await PetQuerySchemaApiPingGetRequest.fetch(
							remoteServer.uri,
							{},
							this._abortController.getTimeoutSignal(this._timeout)
						);
						if(remoteServer.uid !== data.uid){
							throw new Error(
								`Ping answered with UUID ${data.uid}, expected ${remoteServer.uid}`
							);
						}
						await this._database.serverIndexAddServer(data);
					}catch(error){
						this._report(`Server index sync with ${remoteServer.uri} failed`,error);
					}
				}
			}
			catch(error){
				if(this.isInterrupted()){
					return;
				}
				this._report(`Server index sync with ${server.uri} failed`,error);
			}
		}
	}

	protected _onError(error:unknown):void{
		this._report('Server index sync failed',error);
	}

	protected _report(message:utf8_t,error:unknown):void{
		console.error(`${message}: ${util.inspect(error)}`);
	}
};
