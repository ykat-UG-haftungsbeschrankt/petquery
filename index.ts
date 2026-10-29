/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { default as Express } from 'express';
import { default as NodeFs} from 'node:fs';
import { PetQueryArgs } from '#petquery/args.js';
import { PetQueryConfig } from '#petquery/config.js';
import { PetQueryLog } from '#petquery/log.js';
import { PetQueryServer } from '#petquery/server.js';
import { PetQueryServerAuth } from '#petquery/server/auth.js';
import { PetQueryServerConfig } from '#petquery/server/config.js';
import { PetQueryServerIndexSync } from '#petquery/server/timer/index/sync.js';
import { PetQueryServerRouteApi } from '#petquery/server/route/api.js';
import { PetQueryServerRouteAuth } from '#petquery/server/route/auth.js';
import { PetQueryServerRoutePet } from '#petquery/server/route/pet.js';

import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';

import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { Server as NodeHttpServer } from 'node:http';
/*
import {PetQuery3pPluginAnimalidConfig} from
	'#petquery/3p/plugin/animalid/config.js';
import {PetQuery3pPluginAnimalidPlugin} from
	'#petquery/3p/plugin/animalid/plugin.js';
import {PetQuery3pPluginMysqlPlugin} from
	'#petquery/3p/plugin/mysql/plugin.js';

import {PetQuery3pPluginMysqlConfig} from
	'#petquery/3p/plugin/mysql/config.js';
*/

const args = new PetQueryArgs(process.argv.slice(2));
if(!NodeFs.existsSync(args.getConfigPath())){
	const app = Express();
	app.use(Express.json({limit:1024*1024*10}));
	app.get('/bootstrap',(UNUSED_req,res)=>{
		res.type('text/plain').send(`${args.getPort()}`);
	});
	let bootstrapServer:NodeHttpServer|null = null;
	app.post('/bootstrap',(request,response)=>{
		let config:PetQuerySchemaServerDatabaseConfigEntryType;
		try{
			config = PetQuerySchemaServerDatabaseConfigEntry.fromJson(
				request.body
			);
		}
		catch(error){
			response.status(400).type('text/plain').send(
				error instanceof Error
					? error.message
					: 'Invalid server configuration'
			);
			return;
		}
		NodeFs.writeFileSync(
			args.getConfigPath(),
			JSON.stringify(config,null,2),
			{flag:'wx'}
		);
		response.once('finish',()=>{
			const activeServer = bootstrapServer;
			if(null === activeServer){
				console.error('Bootstrap server is unavailable');
				process.exit(1);
				return;
			}
			activeServer.close((error)=>{
				if(undefined !== error){
					console.error(
						'Failed to close bootstrap server',
						error
					);
					process.exit(1);
					return;
				}
				main(args).catch((startError:unknown)=>{
					console.error(
						'Failed to start PetQuery after bootstrap',
						startError
					);
					process.exit(1);
				});
			});
		});
		response.status(201).type('text/plain').send('saved');
	});
	bootstrapServer = app.listen(args.getPort(),'127.0.0.1',()=>{
		console.log(
			`Bootstrap server running at http://127.0.0.1:`
			+`${args.getPort()}/`
		);
	});
}else{
	await main(args);
}

async function main(args: PetQueryArgs):Promise<void>{
	await PetQueryConfig.loadFromFile(args.getConfigPath());
	const serverConfig = PetQueryConfig.getServerConfig();
	const indexConfig = serverConfig.index;
	const database = serverConfig.database;
	const serverServerConfig = new PetQueryServerConfig(
		serverConfig.gid,
		serverConfig.database
	);
	const auth = new PetQueryServerAuth(
		serverConfig,
		database
	);
	const server = new PetQueryServer(
		serverConfig,
		database,
		serverConfig.gid,
		serverServerConfig,
		auth,
		database
	);
	const serverIndexSync = new PetQueryServerIndexSync(
		database,
		serverConfig.gid,
		indexConfig.sync.interval,
		indexConfig.sync.timeout,
		indexConfig.sync.max_servers
	);

	async function shutdown():Promise<void>{
		await Promise.allSettled([
			serverIndexSync.destructor(),
			server.destructor()
		]);
		await Promise.allSettled([
			auth.destructor(),
			serverServerConfig.destructor()
		]);
		await database.destructor();
		process.exit(0);
	}

	function onSignal():void{
		shutdown().catch(onShutdownError);
	}

	function onShutdownError(error:unknown):void{
		PetQueryLog.getInstance().error('Shutdown failed',error);
		process.exit(1);
	}

	process.once('SIGINT',onSignal);
	process.once('SIGTERM',onSignal);
	/*
	server.addPlugin(
		new PetQuery3pPluginAnimalidPlugin(PetQueryConfig.getPluginConfig(
			PetQuery3pPluginAnimalidConfig
			,'animalid.by'
		))
	);
	server.addPlugin(
		new PetQuery3pPluginMysqlPlugin(PetQueryConfig.getPluginConfig(
			PetQuery3pPluginMysqlConfig
			,'mysql'
		))
	);
	*/
	server.registerRoutes([
		new PetQueryServerRouteApi(server),
		new PetQueryServerRoutePet(server),
		new PetQueryServerRouteAuth(server)
	]);
	server.start();
	if(indexConfig.sync.enabled){
		serverIndexSync.start();
	}
}