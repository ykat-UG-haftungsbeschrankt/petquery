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

import type { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
import { PetQuerySchemaServerDatabaseConfigEntry } from '#schema/server/database/config/entry.js';
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

const args = new PetQueryArgs(process.argv);
if(!NodeFs.existsSync(args.getConfigPath())){
	const app = Express();
	app.use(Express.json({limit:1024*1024*10}));
	app.post('/bootstrap',async(req, res)=>{
		const json = JSON.parse(req.body);
		const config = PetQuerySchemaServerDatabaseConfigEntry.fromJson(json);
		NodeFs.writeFileSync(
			 args.getConfigPath()
			,JSON.stringify(config, null, 2)
		);
		await main(args);
		res.send('Bootstrap received');
	});
	app.listen(args.getPort(),()=>{
		console.log(`Server is running on port ${args.getPort()}`);
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
		serverUuid,
		serverServerConfig,
		auth,
		database
	);
	const serverIndexSync = new PetQueryServerIndexSync(
		database,
		serverUuid,
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