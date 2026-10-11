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

const server = new PetQueryServer(PetQueryConfig.getServerConfig());

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
	new PetQueryServerRouteHtml(server)
]);
server.start();