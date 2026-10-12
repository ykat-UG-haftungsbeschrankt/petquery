/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryConfig} from '#petquery/config.js';
import {PetQueryServer} from '#petquery/server.js';
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
import { PetQueryServerRouteHtml } from '#petquery/server/route/html.js';
import {PetQueryServerRouteDocs} from '#petquery/server/route/docs.js';
import {PetQueryServerRouteAdmin} from '#petquery/server/route/admin.js';
import {PetQueryServerRouteAuth} from '#petquery/server/route/auth.js';
import {PetQueryServerRoutePet} from '#petquery/server/route/pet.js';
import {PetQueryServerDatabaseLmdb} from
	'#petquery/server/database/lmdb.js';
import type {PetQueryServerDatabase} from '#petquery/server/database.js';
import {PetQueryServerIndex} from '#petquery/server/index.js';
import {PetQueryServerIndexSync} from '#petquery/server/index/sync.js';
import {PetQueryServerConfig} from '#petquery/server/config.js';
import {PetQueryServerAuth} from '#petquery/server/auth.js';
import {PetQueryServerPetStore} from '#petquery/server/pet/store.js';
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
const authUserDatabase = new PetQueryServerDatabaseLmdb(
	indexConfig.path,
	serverConfig.authenticate.lmdb.users_name
);
const authSessionDatabase = new PetQueryServerDatabaseLmdb(
	indexConfig.path,
	serverConfig.authenticate.lmdb.sessions_name
);
const petDatabase = new PetQueryServerDatabaseLmdb(
	indexConfig.path,
	serverConfig.pet_database.name
);
const serverIndex = new PetQueryServerIndex(serverDatabase);
const serverUuid = await loadServerUuid(settingsDatabase);
const auth = new PetQueryServerAuth(
	serverConfig,
	authUserDatabase,
	authSessionDatabase
);
const petStore = new PetQueryServerPetStore(petDatabase);
const server = new PetQueryServer(
	serverConfig,
	serverIndex,
	serverUuid,
	serverConfigFile,
	auth,
	petStore
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
	await Promise.allSettled([
		Promise.resolve(adminRoute.destructor()),
		Promise.resolve(petStore.destructor()),
		Promise.resolve(auth.destructor()),
		serverIndexSync.destructor(),
		server.destructor(),
		Promise.resolve(serverIndex.destructor()),
		petDatabase.destructor(),
		authSessionDatabase.destructor(),
		authUserDatabase.destructor(),
		serverDatabase.destructor(),
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
	new PetQueryServerRouteHtml(server),
	new PetQueryServerRouteDocs(server),
	adminRoute
]);
server.start();
if(indexConfig.sync.enabled){
	serverIndexSync.start();
}