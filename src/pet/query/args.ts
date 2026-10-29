/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import commandLineArgs from 'command-line-args';
import { PetQueryDestructor } from '#petquery/destructor.js';

export class PetQueryArgs extends PetQueryDestructor{
	protected readonly _configPath:filename_t;
	protected readonly _configPort:port_t;

	constructor(argv:readonly utf8_t[]){
		super();
		const options = commandLineArgs([
			{
				name:'config',
				type:String,
				defaultOption:true
			},
			{
				name:'port',
				type:Number
			}
		],{argv:[...argv]});

		const configPath:unknown = options.config;
		if('string' !== typeof configPath || '' === configPath.trim()){
			throw new Error(
				'Usage: node dist/index.js --config <server-config.json> --port <port>'
			);
		}
		this._configPath = configPath.trim();

		const configPort:port_t = options.port;
		if('number' !== typeof configPort
		|| isNaN(configPort)
		|| configPort <= 0
		|| configPort > 65535){
			throw new Error(
				'Usage: node dist/index.js --config <server-config.json> --port <port>'
			);
		}
		this._configPort = configPort;
	}

	getConfigPath():filename_t{
		this._assertNotDestroyed();
		return this._configPath;
	}

	getPort():port_t{
		this._assertNotDestroyed();
		return this._configPort;
	}

	async _destructor():Promise<void>{
	}
};