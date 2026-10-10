import {PetQueryConfig} from '#petquery/config.js';
import {PetQueryServer} from '#petquery/server/index.js';
import {PetQueryPluginAnimalidByConfig} from '#petquery/plugin/animalid.by/index.js';
import {PetQueryPluginAnimalidBy} from
	'#petquery/plugin/animalid.by/index.js';
import {PetQueryPluginMysql} from
	'#petquery/plugin/mysql/index.js';

import {PetQueryPluginMysqlConfig} from '#petquery/plugin/mysql/index.js';

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

server.start();