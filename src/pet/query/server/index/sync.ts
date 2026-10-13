/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import {PetQueryTimer} from '#petquery/timer.js';
import type {PetQueryDatabase} from '#petquery/database.js';
import {PetQuerySchemaApiPingGetRequest} from
	'#schema/api/ping/get/request.js';
import {PetQuerySchemaApiServerGetRequest} from
	'#schema/api/server/get/request.js';
import {PetQueryServerRequestSchema} from
	'#petquery/server/request/schema.js';

// Periodically fetches the server list of every known server and merges it
// into the index. A remote entry is added, or replaces a known URI, only
// when pinging its URI answers with the same UUID. The index is borrowed.
export class PetQueryServerIndexSync{
	protected readonly _database:PetQueryDatabase;
	protected readonly _uuid:uuid_t;
	protected readonly _interval:milliseconds_t;
	protected readonly _timeout:milliseconds_t;
	protected readonly _maxServers:uint_t;
	protected readonly _abortController:AbortController;
	protected readonly _timer:PetQueryTimer;
	protected _destructorPromise:Promise<void>|null;

	// uuid is this server's own UUID; entries with it are never merged.
	constructor(
		database:PetQueryDatabase,
		uuid:uuid_t,
		interval:milliseconds_t,
		timeout:milliseconds_t,
		maxServers:uint_t
	){
		this._database = database;
		this._uuid = uuid;
		this._interval = interval;
		this._timeout = timeout;
		this._maxServers = maxServers;
		this._abortController = new AbortController();
		this._timer = new PetQueryTimer(
			interval,
			this._runTimer.bind(this),
			this._reportTimerError.bind(this)
		);
		this._destructorPromise = null;
	}

	// Runs a sync immediately, then every interval after the previous run
	// finishes, so runs never overlap.
	start():void{
		if(null !== this._destructorPromise){
			throw new Error('Server index sync is destroyed');
		}
		this._timer.start();
	}

	// Runs one sync pass. Failures of single servers are reported and
	// skipped; failures reading the local index reject.
	async sync():Promise<void>{
		const known = await this._database.getServerList();
		for(const [uuid,uri] of [...known]){
			if(this._abortController.signal.aborted){
				return;
			}
			if(this._uuid === uuid){
				continue;
			}
			try{
				const remote = await this._fetchServerList(uri);
				await this._merge(remote,known);
			}
			catch(error){
				if(this._abortController.signal.aborted){
					return;
				}
				this._report(`Server index sync with ${uri} failed`,error);
			}
		}
	}

	destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
		try{
			this._abortController.abort();
			await this._timer.destructor();
		}
		catch(UNUSED_e){
		}
	}

	protected _runTimer():Promise<void>{
		return this.sync();
	}

	protected _reportTimerError(error:unknown):void{
		this._report('Server index sync failed',error);
	}

	protected async _merge(
		remote:Map<uuid_t,uri_t>,
		known:Map<uuid_t,uri_t>
	):Promise<void>{
		for(const [uuid,uri] of remote){
			if(this._abortController.signal.aborted){
				return;
			}
			if(this._uuid === uuid || uri === known.get(uuid)){
				continue;
			}
			try{
				const pingUuid = await this._ping(uri);
				if(uuid !== pingUuid){
					throw new Error(
						`Ping answered with UUID ${pingUuid}, expected ${uuid}`
					);
				}
				await this._database.addServer(uuid,uri);
				known.set(uuid,uri);
			}
			catch(error){
				if(this._abortController.signal.aborted){
					return;
				}
				this._report(`Server ${uuid} at ${uri} rejected`,error);
			}
		}
	}

	protected async _fetchServerList(uri:uri_t):Promise<Map<uuid_t,uri_t>>{
		const parsed = await PetQuerySchemaApiServerGetRequest.fetch(
			uri,
			this._timeout,
			this._abortController.signal
		);
		const ret = new Map<uuid_t,uri_t>();
		try{
			const data = parsed.getValues().data;
			for(const entry of data.slice(0,this._maxServers)){
				if(PetQueryServerRequestSchema.isHttpUri(entry.uri)){
					ret.set(entry.uuid,entry.uri);
				}
			}
		}
		finally{
			parsed.destructor();
		}
		return ret;
	}

	protected async _ping(uri:uri_t):Promise<uuid_t>{
		const parsed = await PetQuerySchemaApiPingGetRequest.fetch(
			uri,
			this._timeout,
			this._abortController.signal
		);
		try{
			return parsed.getValues().data.uuid;
		}
		finally{
			parsed.destructor();
		}
	}

	protected _report(message:utf8_t,error:unknown):void{
		console.error(`${message}: ${util.inspect(error)}`);
	}
};
