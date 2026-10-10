import {PetQueryPluginMongodbConfig} from '#petquery/plugin/mongodb/index.js';
import { PetQueryPluginResultSource } from './plugin.js';
//import { PetQueryPluginEuropetnetOrgConfig } from './plugin/europetnet.org/index.js';
import { PetQueryTypes } from './types.js';
import { PetQueryPluginConfig } from './plugin.js';
import type { PetQueryServerRequest, PetQueryServerResponse } from './server/index.js';
import { PetQueryPluginPetqueryConfig } from './plugin/petquery/index.js';
import { PetQueryPluginMysqlConfig } from './plugin/mysql/index.js';
import { PetQueryPluginErrorConfig } from './plugin/error/index.js';
import { PetQueryPluginTestConfig } from './plugin/test/index.js';
import { PetQueryPluginAnimalidByConfig } from './plugin/animalid.by/index.js';
import fileUpload from 'express-fileupload';
import { PetQueryAssert } from './assert.js';

//const { authenticate_api } = require('express-oauth2-jwt-bearer');
//const { authenticate_json } = require('express-oauth2-jwt-bearer');

function authenticate(
	req:PetQueryServerRequest,
	res:PetQueryServerResponse,
	next:()=>void
):void{
	const str = String(req.headers?.authorization).split(' ')[1];
	if(!settings.server.authenticate.bearer.has(str)){
		res.status(403).end();
	}else{
		next();
	}
}

const settings = {
	server:{
		http:{
			port:50000 as port_t
			,enabled:true
		}
		,https:{
			port:50000 as port_t
			,enabled:false
			,certificate:{
				// cert:fs.readFileSync("/etc/letsencrypt//fullchain.pem")
				//,key:fs.readFileSync("/etc/letsencrypt//privkey.pem")
			}
		}
		,authenticate:{
			bearer:new Set<string>([
				'75258ce9e0a7e751ce4e78cf20dd3f8f'
				,'c815512c071af26c864e6af29c2e2080'
				,'7b6795176a5b09bd80c4ec5ea6f7da6e'
				,'6d2d50aadc7004131b2992c9df88b1cf'
				,'764986b1436c3cf81054393ccd666e52'
				,'11030192d336705d43196b118eed1eac'
				,'c7c9cb95cbd6b3153955bdd75481a352'
				,'808d11ed47ec3e9823f0f3fed1ff6978'
				,'99a7f89c23149355077b0e07e6ee4ac8'
				,'f3dea1c3d8cd3faab10750fc96b2a5da'
			])
		}
		,file:{
			upload:{
				enabled:true,
				options:{
					limits:{
						fileSize:10 * 1024 * 1024 // 10 MB
					},
					abortOnLimit:true,
					useTempFiles:false
				} as fileUpload.Options
			}
		}
		,max_results_per_module:10 as uint_t
		,max_results_total:1000 as uint_t
		,route:{
			api:{
				module:'test'
				,enabled:true
				,authenticate:authenticate
			}
			,json:{
				enabled:true
				,authenticate:authenticate
			}
			,"/":{
				enabled:true
			}
		}
	}
	,plugin:new Map<string,PetQueryPluginConfig>([
		["animalid.by",new PetQueryPluginAnimalidByConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					 favicon:'https://animalid.by/favicon.ico'
					,url:'https://animalid.by'
					,name:'Animalid'
				})
			}
		)]
		/*,["europetnet.org",new PetQueryPluginEuropetnetOrgConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					 favicon:'https://europetnet.org/favicon.ico'
					,url:'https://europetnet.org'
					,name:'Europetnet'
				})
			}
		)]*/
		,["test",new PetQueryPluginTestConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					favicon:'',
					url:'',
					name:'test'
				})
			}
			,{
				ain:'1234'
			}
		)]
		,["error",new PetQueryPluginErrorConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					favicon:'',
					url:'',
					name:'test'
				})
			}
		)]
		,["mongodb",new PetQueryPluginMongodbConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					favicon:'',
					url:'',
					name:'test'
				})
			}
			,{
				uri:'mongodb://localhost:27017',
				db:'test',
				collection:'test'
			}
		)]
		,["mysql",new PetQueryPluginMysqlConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					favicon:'',
					url:'',
					name:'test'
				})
			}
			,{
				  dbCfg: {}
				 ,query: ''
			}
		)]
		,["petquery",new PetQueryPluginPetqueryConfig(
			{
				enabled:false,
				timeout:5000,
				source:new PetQueryPluginResultSource({
					favicon:'',
					url:'',
					name:'test'
				})
			}
			,{
				uri: '',
				headers: {
					'Authorization': ''
				}
			}
		)]
	])
};

export type PetQueryConfigServerType = typeof settings.server;
export type PetQueryConfigPluginType = typeof settings.plugin;

export class PetQueryConfig{
	static getServerConfig(){
		return settings.server;
	}

	static getPluginConfig<T extends object>(obj:ConstructorType<T>,name:string):T{
		const config = settings.plugin.get(name);
	
		if(undefined === config
		|| !PetQueryTypes.isInstanceOf<T>(obj,config)){
			throw new Error(`Unknown plugin "${name}"`);
		}
		
		PetQueryAssert.assertInstanceOf<T>(obj,config);

		return config;
	}

	static isPluginEnabled(name:string):boolean{
		return settings.plugin.get(name)?.isEnabled() === true;
	}
}