/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryConfig} from '#petquery/config.js';
import {PetQueryServer} from '#petquery/server.js';
import {PetQueryPluginAnimalidByConfig} from
	'#petquery/plugin/animalid/by/config.js';
import {PetQueryPluginAnimalidBy} from '#petquery/plugin/animalid/by.js';
import {PetQueryPluginMysql} from '#petquery/plugin/mysql.js';

import {PetQueryPluginMysqlConfig} from '#petquery/plugin/mysql/config.js';
import { PetQueryServerRouteJson } from '#petquery/server/route/json.js';
import { PetQueryServerRouteApi } from '#petquery/server/route/api.js';
import { PetQueryServerRouteHtml } from '#petquery/server/route/html.js';
import {PetQueryServerRouteAdmin} from '#petquery/server/route/admin.js';
import {PetQueryServerDatabaseLmdb} from
	'#petquery/server/database/lmdb.js';
import type {PetQueryServerDatabase} from '#petquery/server/database.js';
import {PetQueryServerIndex} from '#petquery/server/index.js';
import {PetQueryServerIndexSync} from '#petquery/server/index/sync.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import {v4 as uuidv4, validate as uuidValidate} from 'uuid';

// Returns the UUID stored in db, generating and storing one on first start.
async function loadServerUuid(db:PetQueryServerDatabase):Promise<uuid_t>{
	const stored = await db.get('uuid');
	if(undefined !== stored){
		if(!uuidValidate(stored)){
			throw new Error(`Stored server UUID is invalid: ${stored}`);
		}
		return stored;
	}
	const uuid = uuidv4();
	await db.put('uuid',uuid);
	return uuid;
}

const serverConfig = PetQueryConfig.getServerConfig();
const serverConfigFile = new PetQueryServerConfig(
	serverConfig.config_file,
	PetQueryConfig.getPluginNames()
);
const savedServerConfig = await serverConfigFile.load();
if(null !== savedServerConfig){
	PetQueryServerConfig.applyToServerConfig(serverConfig,savedServerConfig);
}
const indexConfig = serverConfig.server_index;
const settingsDatabase = new PetQueryServerDatabaseLmdb(
	indexConfig.path,
	indexConfig.settings_name
);
const serverDatabase = new PetQueryServerDatabaseLmdb(
	indexConfig.path,
	indexConfig.name
);
const serverIndex = new PetQueryServerIndex(serverDatabase);
const serverUuid = await loadServerUuid(settingsDatabase);
const server = new PetQueryServer(
	serverConfig,
	serverIndex,
	serverUuid,
	serverConfigFile
);
const adminRoute = new PetQueryServerRouteAdmin(server);
const serverIndexSync = new PetQueryServerIndexSync(
	serverIndex,
	serverUuid,
	indexConfig.sync.interval,
	indexConfig.sync.timeout,
	indexConfig.sync.max_servers
);

async function shutdown():Promise<void>{
	adminRoute.destructor();
	await serverIndexSync.destructor();
	serverIndex.destructor();
	await serverDatabase.destructor();
	await settingsDatabase.destructor();
	await serverConfigFile.destructor();
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

server.addPlugin(
	new PetQueryPluginAnimalidBy(PetQueryConfig.getPluginConfig(
		 PetQueryPluginAnimalidByConfig
		,'animalid.by'
	))
);
server.addPlugin(
	new PetQueryPluginMysql(PetQueryConfig.getPluginConfig(
		PetQueryPluginMysqlConfig
		,'mysql'
	))
);
server.registerRoutes([
	new PetQueryServerRouteJson(server),
	new PetQueryServerRouteApi(server),
	new PetQueryServerRouteHtml(server),
	adminRoute
]);
server.start();
if(indexConfig.sync.enabled){
	serverIndexSync.start();
}