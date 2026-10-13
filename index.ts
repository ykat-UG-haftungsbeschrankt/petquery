/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryConfig} from '#petquery/config.js';
import {PetQueryServer} from '#petquery/server.js';
import type {PetQueryServerDatabaseIndex} from
	'#petquery/server/database/index.js';
import {PetQuery3pPluginAnimalidConfig} from
	'#petquery/3p/plugin/animalid/config.js';
import {PetQuery3pPluginAnimalidPlugin} from
	'#petquery/3p/plugin/animalid/plugin.js';
import {PetQuery3pPluginMysqlPlugin} from
	'#petquery/3p/plugin/mysql/plugin.js';

import {PetQuery3pPluginMysqlConfig} from
	'#petquery/3p/plugin/mysql/config.js';
import { PetQueryServerRouteJson } from '#petquery/server/route/json.js';
import { PetQueryServerRouteApi } from '#petquery/server/route/api.js';
import {PetQueryServerRouteDefault} from
	'#petquery/server/route/default.js';
import {PetQueryServerRouteDocs} from '#petquery/server/route/docs.js';
import {PetQueryServerRouteGui} from '#petquery/server/route/gui.js';
import {PetQueryServerRouteAuth} from '#petquery/server/route/auth.js';
import {PetQueryServerRoutePet} from '#petquery/server/route/pet.js';
import {PetQueryServerIndexSync} from '#petquery/server/index/sync.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import {PetQueryServerAuth} from '#petquery/server/auth.js';
import {v4 as uuidv4, validate as uuidValidate} from 'uuid';

// Returns the UUID stored in db, generating and storing one on first start.
async function loadServerUuid(
	db:PetQueryServerDatabaseIndex
):Promise<uuid_t>{
	const stored = await db.serverIndexGet('uuid');
	if(undefined !== stored){
		if(!uuidValidate(stored)){
			throw new Error(`Stored server UUID is invalid: ${stored}`);
		}
		return stored;
	}
	const uuid = uuidv4();
	await db.serverIndexPut('uuid',uuid);
	return uuid;
}

const serverConfig = PetQueryConfig.getServerConfig();
const indexConfig = serverConfig.index;
const indexDatabase = indexConfig.database;
const settingsDatabase = indexDatabase.createSettingsDatabase();
const serverConfigFile = new PetQueryServerConfig(
	settingsDatabase,
	PetQueryConfig.getPluginNames()
);
const savedServerConfig = await serverConfigFile.load();
if(null !== savedServerConfig){
	PetQueryServerConfig.applyToServerConfig(serverConfig,savedServerConfig);
}
const authUserDatabase = indexDatabase.createSibling(
	serverConfig.authenticate.lmdb.users_name
);
const authSessionDatabase = indexDatabase.createSibling(
	serverConfig.authenticate.lmdb.sessions_name
);
const serverUuid = await loadServerUuid(settingsDatabase);
const auth = new PetQueryServerAuth(
	serverConfig,
	authUserDatabase,
	authSessionDatabase
);
const petStore = serverConfig.settings.database;
const server = new PetQueryServer(
	serverConfig,
	indexDatabase,
	serverUuid,
	serverConfigFile,
	auth,
	petStore
);
const guiRoute = new PetQueryServerRouteGui(server);
const serverIndexSync = new PetQueryServerIndexSync(
	indexDatabase,
	serverUuid,
	indexConfig.sync.interval,
	indexConfig.sync.timeout,
	indexConfig.sync.max_servers
);

async function shutdown():Promise<void>{
	await Promise.allSettled([
		Promise.resolve(guiRoute.destructor()),
		Promise.resolve(petStore.destructor()),
		Promise.resolve(auth.destructor()),
		serverIndexSync.destructor(),
		server.destructor(),
		serverConfig.settings.database.destructor(),
		authSessionDatabase.destructor(),
		authUserDatabase.destructor(),
		indexDatabase.destructor(),
		settingsDatabase.destructor(),
		serverConfigFile.destructor()
	]);
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
server.registerRoutes([
	new PetQueryServerRouteJson(server),
	new PetQueryServerRouteApi(server),
	new PetQueryServerRoutePet(server),
	new PetQueryServerRouteAuth(server),
	new PetQueryServerRouteDefault(server),
	new PetQueryServerRouteDocs(server),
	guiRoute
]);
server.start();
if(indexConfig.sync.enabled){
	serverIndexSync.start();
}