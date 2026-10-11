/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import util from 'node:util';
import {validate as uuidValidate} from 'uuid';
import {PetQueryTypes} from '#petquery/types.js';
import type {PetQueryServerIndex} from '#petquery/server/index.js';

// Periodically fetches the server list of every known server and merges it
// into the index. A remote entry is added, or replaces a known URI, only
// when pinging its URI answers with the same UUID. The index is borrowed.
export class PetQueryServerIndexSync{
	protected readonly _serverIndex:PetQueryServerIndex;
	protected readonly _uuid:uuid_t;
	protected readonly _interval:milliseconds_t;
	protected readonly _timeout:milliseconds_t;
	protected readonly _maxServers:uint_t;
	protected readonly _abortController:AbortController;
	protected _timer:NodeJS.Timeout|null;
	protected _running:Promise<void>|null;
	protected _destructorPromise:Promise<void>|null;

	// uuid is this server's own UUID; entries with it are never merged.
	constructor(
		serverIndex:PetQueryServerIndex,
		uuid:uuid_t,
		interval:milliseconds_t,
		timeout:milliseconds_t,
		maxServers:uint_t
	){
		this._serverIndex = serverIndex;
		this._uuid = uuid;
		this._interval = interval;
		this._timeout = timeout;
		this._maxServers = maxServers;
		this._abortController = new AbortController();
		this._timer = null;
		this._running = null;
		this._destructorPromise = null;
	}

	// Runs a sync immediately, then every interval after the previous run
	// finishes, so runs never overlap.
	start():void{
		if(null !== this._destructorPromise){
			throw new Error('Server index sync is destroyed');
		}
		if(null !== this._timer || null !== this._running){
			return;
		}
		this._schedule(0);
	}

	// Runs one sync pass. Failures of single servers are reported and
	// skipped; failures reading the local index reject.
	async sync():Promise<void>{
		const known = await this._serverIndex.getServerList();
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
			if(null !== this._timer){
				clearTimeout(this._timer);
				this._timer = null;
			}
			this._abortController.abort();
			if(null !== this._running){
				await this._running;
			}
		}
		catch(UNUSED_e){
		}
	}

	protected _schedule(delay:milliseconds_t):void{
		this._timer = setTimeout(this._onTimer.bind(this),delay);
	}

	protected _onTimer():void{
		this._timer = null;
		this._running = this.sync()
			.catch(this._onSyncError.bind(this))
			.finally(this._onSyncDone.bind(this));
	}

	protected _onSyncError(error:unknown):void{
		this._report('Server index sync failed',error);
	}

	protected _onSyncDone():void{
		this._running = null;
		if(null === this._destructorPromise){
			this._schedule(this._interval);
		}
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
				await this._serverIndex.addServer(uuid,uri);
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
		const json = await this._fetchJson(uri,'api/server/get');
		const ret = new Map<uuid_t,uri_t>();
		if(!PetQueryTypes.isObject(json)){
			throw new Error('Invalid server list response');
		}
		const data:unknown = (json as {data?:unknown}).data;
		if(!PetQueryTypes.isArray(data)){
			throw new Error('Invalid server list response');
		}
		for(const entry of (data as unknown[]).slice(0,this._maxServers)){
			if(!PetQueryTypes.isObject(entry)){
				continue;
			}
			const {uuid,uri:entryUri} =
				entry as {uuid?:unknown,uri?:unknown};
			if(!PetQueryTypes.isString(uuid)
			|| !uuidValidate(uuid as string)
			|| !PetQueryTypes.isString(entryUri)
			|| !this._isHttpUri(entryUri as string)){
				continue;
			}
			ret.set(uuid as uuid_t,entryUri as uri_t);
		}
		return ret;
	}

	protected async _ping(uri:uri_t):Promise<uuid_t>{
		const json = await this._fetchJson(uri,'api/ping/get');
		const data:unknown = PetQueryTypes.isObject(json)
			? (json as {data?:unknown}).data
			: undefined;
		const uuid:unknown = PetQueryTypes.isObject(data)
			? (data as {uuid?:unknown}).uuid
			: undefined;
		if(!PetQueryTypes.isString(uuid) || !uuidValidate(uuid as string)){
			throw new Error('Invalid ping response');
		}
		return uuid as uuid_t;
	}

	protected async _fetchJson(uri:uri_t,path:utf8_t):Promise<unknown>{
		const response = await fetch(this._resolve(uri,path),{
			method:'GET',
			headers:{accept:'application/json'},
			// Redirects could point the request at an unrelated host.
			redirect:'error',
			signal:AbortSignal.any([
				this._abortController.signal,
				AbortSignal.timeout(this._timeout)
			])
		});
		if(!response.ok){
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}
		return response.json();
	}

	// Resolves path against the server's base URI, keeping its own path.
	protected _resolve(uri:uri_t,path:utf8_t):URL{
		if(!this._isHttpUri(uri)){
			throw new Error(`Unsupported server URI: ${uri}`);
		}
		const base = new URL(uri);
		if(!base.pathname.endsWith('/')){
			base.pathname += '/';
		}
		base.search = '';
		base.hash = '';
		return new URL(path,base);
	}

	protected _isHttpUri(uri:utf8_t):boolean{
		if(!URL.canParse(uri)){
			return false;
		}
		const protocol = new URL(uri).protocol;
		return 'http:' === protocol || 'https:' === protocol;
	}

	protected _report(message:utf8_t,error:unknown):void{
		console.error(`${message}: ${util.inspect(error)}`);
	}
};
