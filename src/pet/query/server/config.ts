/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {randomUUID} from 'node:crypto';
import {mkdir, readFile, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {PetQueryCast} from '#petquery/cast.js';
import type {PetQueryConfigServerType} from '#petquery/config.js';

const cast = PetQueryCast;
const flag = cast.values([true,false]);
// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

const valuesParser = cast.object({
	 http:cast.object({
		port:cast.int({min:1,max:65535})
	})
	,authenticate:cast.object({
		// Printable ASCII without spaces, see authenticate() in config.ts.
		bearer:cast.array(
			cast.string({match:/^[\x21-\x7e]{16,256}$/}),
			{minLength:1,maxLength:100}
		)
	})
	,file:cast.object({
		upload:cast.object({
			 enabled:flag
			,max_file_size:cast.int({min:1})
		})
	})
	,max_results_per_module:cast.int({min:1,max:1000000})
	,max_results_total:cast.int({min:1,max:1000000})
	,server_index:cast.object({
		sync:cast.object({
			 enabled:flag
			,interval:cast.int({min:1000,max:MAX_TIMER_MS})
			,timeout:cast.int({min:100,max:MAX_TIMER_MS})
			,max_servers:cast.int({min:1,max:1000000})
		})
	})
	,route:cast.object({
		 api:cast.object({
			 enabled:flag
			,plugins:cast.array(
				cast.string({nonEmpty:true}),
				{maxLength:1000}
			)
		})
		,json:cast.object({enabled:flag})
		,'/':cast.object({enabled:flag})
		,admin:cast.object({enabled:flag})
	})
});

export type PetQueryServerConfigValues = ReturnType<
	typeof valuesParser.parse
>;

// Loads, validates and atomically saves the server settings that are
// editable in the admin GUI. Saved values take effect on restart.
export class PetQueryServerConfig{
	protected readonly _path:filename_t;
	protected readonly _pluginNames:Set<utf8_t>;
	protected readonly _pending:Set<Promise<void>>;

	// pluginNames lists the plugins that route.api.plugins may contain.
	constructor(file:filename_t,pluginNames:Iterable<utf8_t>){
		this._path = path.resolve(file);
		this._pluginNames = new Set(pluginNames);
		this._pending = new Set();
	}

	async destructor():Promise<void>{
		try{
			await Promise.allSettled(Array.from(this._pending));
		}
		catch(UNUSED_e){
		}
	}

	// Extracts the editable values from server settings.
	static fromServerConfig(
		config:PetQueryConfigServerType
	):PetQueryServerConfigValues{
		const sync = config.server_index.sync;

		return {
			 http:{port:config.http.port}
			,authenticate:{bearer:Array.from(config.authenticate.bearer)}
			,file:{
				upload:{
					 enabled:config.file.upload.enabled
					,max_file_size:config.file.upload.max_file_size
				}
			}
			,max_results_per_module:config.max_results_per_module
			,max_results_total:config.max_results_total
			,server_index:{
				sync:{
					 enabled:sync.enabled
					,interval:sync.interval
					,timeout:sync.timeout
					,max_servers:sync.max_servers
				}
			}
			,route:{
				 api:{
					 enabled:config.route.api.enabled
					,plugins:Array.from(config.route.api.plugins)
				}
				,json:{enabled:config.route.json.enabled}
				,'/':{enabled:config.route['/'].enabled}
				,admin:{enabled:config.route.admin.enabled}
			}
		};
	}

	// Writes values into server settings in place, so references to nested
	// settings objects stay valid. Call before the server is created.
	static applyToServerConfig(
		config:PetQueryConfigServerType,
		values:PetQueryServerConfigValues
	):void{
		const sync = config.server_index.sync;

		config.http.port = values.http.port;
		config.authenticate.bearer = new Set(values.authenticate.bearer);
		config.file.upload.enabled = values.file.upload.enabled;
		config.file.upload.max_file_size = values.file.upload.max_file_size;
		config.max_results_per_module = values.max_results_per_module;
		config.max_results_total = values.max_results_total;
		sync.enabled = values.server_index.sync.enabled;
		sync.interval = values.server_index.sync.interval;
		sync.timeout = values.server_index.sync.timeout;
		sync.max_servers = values.server_index.sync.max_servers;
		config.route.api.enabled = values.route.api.enabled;
		config.route.api.plugins = new Set(values.route.api.plugins);
		config.route.json.enabled = values.route.json.enabled;
		config.route['/'].enabled = values.route['/'].enabled;
		config.route.admin.enabled = values.route.admin.enabled;
	}

	getPath():filename_t{
		return this._path;
	}

	getPluginNames():Array<utf8_t>{
		return Array.from(this._pluginNames);
	}

	// Validates untrusted JSON, dropping unknown keys and duplicates.
	// Throws PetQueryCast.InvalidInputError or Error on invalid input.
	parse(json:unknown):PetQueryServerConfigValues{
		const values = valuesParser.parse(json);

		values.authenticate.bearer = Array.from(
			new Set(values.authenticate.bearer)
		);
		values.route.api.plugins = Array.from(
			new Set(values.route.api.plugins)
		);
		for(const name of values.route.api.plugins){
			if(!this._pluginNames.has(name)){
				throw new Error(
					`Invalid route.api.plugins, unknown plugin "${name}"`
				);
			}
		}

		return values;
	}

	// Returns the saved values, or null if nothing has been saved yet.
	async load():Promise<PetQueryServerConfigValues|null>{
		let text:utf8_t;

		try{
			text = await readFile(this._path,'utf8');
		}
		catch(error){
			if(error instanceof Error
			&& 'ENOENT' === (error as NodeJS.ErrnoException).code){
				return null;
			}
			throw error;
		}

		try{
			return this.parse(JSON.parse(text));
		}
		catch(error){
			throw new Error(
				`Invalid config file "${this._path}": `
				+(error instanceof Error ? error.message : String(error)),
				{cause:error}
			);
		}
	}

	// Validates and saves values, replacing the file atomically.
	async save(json:unknown):Promise<PetQueryServerConfigValues>{
		const values = this.parse(json);
		const write = this._write(values);

		this._pending.add(write);
		try{
			await write;
		}
		finally{
			this._pending.delete(write);
		}

		return values;
	}

	protected async _write(values:PetQueryServerConfigValues):Promise<void>{
		// A unique temp file per write keeps concurrent saves independent;
		// the last rename wins and readers never see a partial file.
		const temp = `${this._path}.${randomUUID()}.tmp`;

		await mkdir(path.dirname(this._path),{recursive:true});
		try{
			await writeFile(
				temp,
				JSON.stringify(values,null,'\t')+'\n',
				{encoding:'utf8',mode:0o600,flag:'wx'}
			);
			await rename(temp,this._path);
		}
		catch(error){
			await rm(temp,{force:true});
			throw error;
		}
	}
};
