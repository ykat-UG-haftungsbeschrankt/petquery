/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryConfig } from '#petquery/config.js';
import { PetQueryServer } from '#petquery/server.js';
import { PetQueryServerAuth } from '#petquery/server/auth.js';
import { PetQueryServerConfig } from '#petquery/server/config.js';
import { PetQueryServerIndexSync } from '#petquery/server/timer/index/sync.js';
import { PetQueryServerRouteApi } from '#petquery/server/route/api.js';
import { PetQueryServerRouteAuth } from '#petquery/server/route/auth.js';
import { PetQueryServerRouteDefault } from '#petquery/server/route/default.js';
import { PetQueryServerRouteDocs } from '#petquery/server/route/docs.js';
import { PetQueryServerRouteGui } from '#petquery/server/route/gui.js';
import { PetQueryServerRouteOpenapi } from '#petquery/server/route/openapi.js';
import { PetQueryServerRoutePet } from '#petquery/server/route/pet.js';
import { v4 as uuidv4 } from 'uuid';

import type { PetQueryServerDatabaseIndex } from '#petquery/server/database/index.js';
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


// Returns the UUID stored in db, generating and storing one on first start.
async function loadServerUuid(
	db:PetQueryServerDatabaseIndex
):Promise<uuid_t>{
	try{
		return await db.serverIndexGetServerUid();
	}catch(UNUSED_error){
		const uuid = uuidv4();
		await db.serverIndexSetServerUid(uuid);
		return uuid;
	}
}
await PetQueryConfig.loadFromCommandLine(process.argv.slice(2));
const serverConfig = PetQueryConfig.getServerConfig();
const indexConfig = serverConfig.index;
const database = serverConfig.database;
const serverUuid = await loadServerUuid(database.getDbIndex());
const serverServerConfig = new PetQueryServerConfig(
	serverUuid,
	serverConfig.database
);
try{
	const savedServerConfig = await serverServerConfig.load();
	serverServerConfig.applyToServerConfig(serverConfig,savedServerConfig);
}catch(error){
	console.error('Failed to load server config:',error);
}

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
	console.error(error);
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
	new PetQueryServerRouteAuth(server),
	new PetQueryServerRouteDefault(server),
	new PetQueryServerRouteDocs(server),
	new PetQueryServerRouteGui(server),
	new PetQueryServerRouteOpenapi(server)
]);
server.start();
if(indexConfig.sync.enabled){
	serverIndexSync.start();
}