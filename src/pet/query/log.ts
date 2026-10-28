/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { basename } from 'node:path';
import { createInterface } from 'node:readline';
import { createReadStream } from 'node:fs';
import { dirname } from 'node:path';
import { extname } from 'node:path';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { PetQueryLogLevel } from '#petquery/log/level.js';
import util from 'node:util';
import winston from 'winston';

import type { Logform } from 'winston';
import type { Logger } from 'winston';

export { PetQueryLogLevel };

export type PetQueryLogConfig = {
	level:utf8_t;
	request:{
		enabled:bool_t;
	};
	file:{
		path:filename_t;
		max_size:size_t;
		max_files:size_t;
	};
};

export type PetQueryLogEntry = {
	timestamp:utf8_t;
	level:PetQueryLogLevel;
	message:utf8_t;
};

export type PetQueryLogCategory = 'application'|'request';

type PetQueryLogStoredEntry = PetQueryLogEntry & {
	category:PetQueryLogCategory;
};

export type PetQueryLogReadOptions = {
	category?:PetQueryLogCategory;
	level?:PetQueryLogLevel;
	query?:utf8_t;
	limit:size_t;
};

export class PetQueryLog implements Singleton{
	protected static _instance:PetQueryLog|null = null;
	protected readonly _logger:Logger;
	protected _filePath:filename_t|null;
	protected _fileTransport:winston.transports.FileTransportInstance|null;
	protected _maxFiles:size_t;

	private constructor(){
		this._filePath = null;
		this._fileTransport = null;
		this._maxFiles = 0;
		this._logger = winston.createLogger({
			level:PetQueryLogLevel.Info,
			levels:winston.config.npm.levels,
			transports:[
				new winston.transports.Console({
					stderrLevels:[
						PetQueryLogLevel.Error,
						PetQueryLogLevel.Warn
					],
					format:winston.format.combine(
						winston.format.timestamp(),
						winston.format.printf(PetQueryLog._formatConsole)
					)
				})
			]
		});
	}

	static getInstance():PetQueryLog{
		if(null === this._instance){
			this._instance = new PetQueryLog();
		}
		return this._instance;
	}

	static _initialize(config:PetQueryLogConfig):void{
		PetQueryLog.getInstance()._configure(config);
	}

	static _parseLevel(level:utf8_t):PetQueryLogLevel{
		return PetQueryLog._readLevel(level);
	}

	setLevel(level:PetQueryLogLevel):void{
		this._logger.level = level;
	}

	getLevel():PetQueryLogLevel{
		return PetQueryLog._readLevel(this._logger.level);
	}

	error(message:utf8_t,detail?:unknown):void{
		this._write(PetQueryLogLevel.Error,message,detail);
	}

	warn(message:utf8_t,detail?:unknown):void{
		this._write(PetQueryLogLevel.Warn,message,detail);
	}

	info(message:utf8_t,detail?:unknown):void{
		this._write(PetQueryLogLevel.Info,message,detail);
	}

	debug(message:utf8_t,detail?:unknown):void{
		this._write(PetQueryLogLevel.Debug,message,detail);
	}

	_request(message:utf8_t):void{
		this._write(PetQueryLogLevel.Info,message,undefined,'request');
	}

	async _readEntries(
		options:PetQueryLogReadOptions
	):Promise<Array<PetQueryLogEntry>>{
		const filePath = this._filePath;
		if(null === filePath){
			throw new Error('File logging is not configured');
		}

		const entries:Array<PetQueryLogEntry> = [];
		const query = (options.query ?? '').toLowerCase();
		let nextIndex = 0;

		for(
			let index = this._maxFiles - 1;
			0 <= index;
			index -= 1
		){
			const path = this._getFilePath(filePath,index);
			try{
				const input = createReadStream(path,{encoding:'utf8'});
				const lines = createInterface({
					input,
					crlfDelay:Infinity
				});
				for await(const line of lines){
					if('' === line){
						continue;
					}
					const record = PetQueryLog._readEntry(line);
					if(undefined !== options.category
					&& options.category !== record.category){
						continue;
					}
					const entry:PetQueryLogEntry = {
						timestamp:record.timestamp,
						level:record.level,
						message:record.message
					};
					if(undefined !== options.level
					&& options.level !== entry.level){
						continue;
					}
					if('' !== query
					&& !entry.message.toLowerCase().includes(query)){
						continue;
					}
					if(entries.length < options.limit){
						entries.push(entry);
					}else{
						entries[nextIndex] = entry;
						nextIndex = (nextIndex + 1) % options.limit;
					}
				}
			}catch(error){
				if(PetQueryLog._isNotFound(error)){
					continue;
				}
				throw error;
			}
		}

		entries.sort(PetQueryLog._compareEntries);
		return entries;
	}

	protected _configure(config:PetQueryLogConfig):void{
		mkdirSync(dirname(config.file.path),{recursive:true});
		const level = PetQueryLog._readLevel(config.level);
		if(null !== this._fileTransport){
			this._logger.remove(this._fileTransport);
			this._fileTransport.close?.();
		}
		const fileTransport = new winston.transports.File({
			filename:config.file.path,
			options:{mode:0o600},
			maxsize:config.file.max_size,
			maxFiles:config.file.max_files,
			tailable:true,
			format:winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			)
		});
		this._logger.level = level;
		this._logger.add(fileTransport);
		this._filePath = config.file.path;
		this._fileTransport = fileTransport;
		this._maxFiles = config.file.max_files;
	}

	protected _write(
		level:PetQueryLogLevel,
		message:utf8_t,
		detail:unknown,
		category:PetQueryLogCategory = 'application'
	):void{
		if(!this._logger.isLevelEnabled(level)){
			return;
		}
		if(undefined === detail){
			this._logger.log(level,message,{category});
			return;
		}
		this._logger.log(
			level,
			`${message}: ${PetQueryLog._inspect(detail)}`,
			{category}
		);
	}

	protected _getFilePath(
		filePath:filename_t,
		index:size_t
	):filename_t{
		if(0 === index){
			return filePath;
		}
		const extension = extname(filePath);
		const filename = basename(filePath,extension);
		return join(
			dirname(filePath),
			`${filename}${index}${extension}`
		);
	}

	protected static _formatConsole(
		info:Logform.TransformableInfo
	):utf8_t{
		const timestamp = 'string' === typeof info.timestamp
			? info.timestamp
			: new Date().toISOString();
		return `${timestamp} [${info.level}] ${String(info.message)}`;
	}

	protected static _compareEntries(
		left:PetQueryLogEntry,
		right:PetQueryLogEntry
	):int_t{
		return Date.parse(right.timestamp) - Date.parse(left.timestamp);
	}

	protected static _inspect(detail:unknown):utf8_t{
		if('string' === typeof detail){
			return detail;
		}
		if(detail instanceof Error && undefined !== detail.stack){
			return detail.stack;
		}
		return util.inspect(detail,{depth:6,breakLength:Infinity});
	}

	protected static _isNotFound(error:unknown):bool_t{
		return error instanceof Error
			&& 'code' in error
			&& 'ENOENT' === error.code;
	}

	protected static _isRecord(
		value:unknown
	):value is Record<utf8_t,unknown>{
		return 'object' === typeof value
			&& null !== value
			&& !Array.isArray(value);
	}

	protected static _readEntry(line:utf8_t):PetQueryLogStoredEntry{
		const value:unknown = JSON.parse(line);
		if(!PetQueryLog._isRecord(value)
		|| 'string' !== typeof value.timestamp
		|| !Number.isFinite(Date.parse(value.timestamp))
		|| 'string' !== typeof value.level
		|| 'string' !== typeof value.message){
			throw new Error('Invalid log file entry');
		}
		return {
			timestamp:value.timestamp,
			level:PetQueryLog._readLevel(value.level),
			message:value.message,
			category:PetQueryLog._readCategory(value.category)
		};
	}

	protected static _readCategory(
		category:unknown
	):PetQueryLogCategory{
		if(undefined === category || 'application' === category){
			return 'application';
		}
		if('request' === category){
			return 'request';
		}
		throw new Error('Unknown log category');
	}

	protected static _readLevel(level:utf8_t):PetQueryLogLevel{
		if(PetQueryLogLevel.Error === level){
			return PetQueryLogLevel.Error;
		}
		if(PetQueryLogLevel.Warn === level){
			return PetQueryLogLevel.Warn;
		}
		if(PetQueryLogLevel.Info === level){
			return PetQueryLogLevel.Info;
		}
		if(PetQueryLogLevel.Debug === level){
			return PetQueryLogLevel.Debug;
		}
		throw new Error(`Unknown log level "${level}"`);
	}
};
