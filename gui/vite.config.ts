/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

import type { Plugin } from 'vite';

function parseApiOrigin(value:utf8_t|null):utf8_t|null{
	if(null === value || !URL.canParse(value)){
		return null;
	}
	const url = new URL(value);
	if(('http:' !== url.protocol && 'https:' !== url.protocol)
	|| '/' !== url.pathname
	|| '' !== url.search
	|| '' !== url.hash
	|| '' !== url.username
	|| '' !== url.password){
		return null;
	}
	return url.origin;
}

function isLocalSameOrigin(
	origin:utf8_t|undefined,
	host:utf8_t|undefined
):bool_t{
	if(undefined === origin || undefined === host
	|| !URL.canParse(origin)){
		return false;
	}
	const url = new URL(origin);
	const isLoopback = '127.0.0.1' === url.hostname
		|| 'localhost' === url.hostname
		|| '[::1]' === url.hostname
		|| '::1' === url.hostname;
	return 'http:' === url.protocol && url.host === host && isLoopback;
}

function isMissingFile(error:unknown):bool_t{
	return error instanceof Error
		&& 'code' in error
		&& 'ENOENT' === error.code;
}

async function writeApiEndpoint(
	envPath:filename_t,
	target:utf8_t
):Promise<void>{
	let contents:utf8_t;
	try{
		contents = await readFile(envPath,'utf8');
	}
	catch(error){
		if(!isMissingFile(error)){
			throw error;
		}
		contents = '';
	}
	const lines = '' === contents ? [] : contents.split(/\r?\n/);
	while(0 < lines.length && '' === lines[lines.length - 1]){
		lines.pop();
	}
	const output:Array<utf8_t> = [];
	let replaced = false;
	for(const line of lines){
		if(/^\s*(?:export\s+)?PETQUERY_API_URL\s*=/.test(line)){
			if(!replaced){
				output.push(`PETQUERY_API_URL=${target}`);
				replaced = true;
			}
		}else{
			output.push(line);
		}
	}
	if(!replaced){
		output.push(`PETQUERY_API_URL=${target}`);
	}
	await writeFile(envPath,`${output.join('\n')}\n`,'utf8');
}

function apiEndpointWriter(
	envPath:filename_t,
	configured:bool_t
):Plugin{
	return {
		name:'petquery-api-endpoint-writer',
		configureServer(server){
			server.middlewares.use((request,response,next)=>{
				const requestUrl = request.url ?? '/';
				const pathname = requestUrl.split('?',1)[0];
				if('/__petquery/api-endpoint' !== pathname){
					next();
					return;
				}
				response.setHeader(
					'content-type',
					'text/plain; charset=utf-8'
				);
				response.setHeader('cache-control','no-store');
				if('GET' === request.method){
					response.statusCode = 200;
					response.end(configured ? 'configured' : 'missing');
					return;
				}
				if('POST' !== request.method){
					response.statusCode = 405;
					response.setHeader('allow','GET, POST');
					response.end('Method not allowed');
					return;
				}
				if(!isLocalSameOrigin(
					request.headers.origin,
					request.headers.host
				)){
					response.statusCode = 403;
					response.end('Local same-origin request required');
					return;
				}
				const endpointUrl = new URL(
					requestUrl,
					'http://127.0.0.1'
				);
				const target = parseApiOrigin(
					endpointUrl.searchParams.get('endpoint')
				);
				if(null === target){
					response.statusCode = 400;
					response.end(
						'Enter a valid HTTP(S) API origin.'
					);
					return;
				}
				writeApiEndpoint(envPath,target).then(
					()=>{
						response.statusCode = 200;
						response.end('saved');
					},
					(error:unknown)=>{
						response.statusCode = 500;
						response.end(error instanceof Error
							? error.message
							: 'Unable to save the API endpoint');
					}
				);
			});
		}
	};
}

export default defineConfig(({mode})=>{
	const guiRoot = fileURLToPath(new URL('.',import.meta.url));
	const env = loadEnv(mode,guiRoot,'PETQUERY_');
	const envApiTarget = env.PETQUERY_API_URL;
	const target = undefined === envApiTarget || '' === envApiTarget
		? null
		: parseApiOrigin(envApiTarget);
	if(undefined !== envApiTarget && '' !== envApiTarget
	&& null === target){
		throw new Error(
			'PETQUERY_API_URL must be an HTTP(S) origin in gui/.env.local'
		);
	}
	const envPath = fileURLToPath(new URL('./.env.local',import.meta.url));
	const petQueryRoot = fileURLToPath(
		new URL('../src/pet/query',import.meta.url)
	);
	const schemaRoot = fileURLToPath(new URL('../schema',import.meta.url));

	return {
		resolve:{
			alias:[
				{
					find:'#gui',
					replacement:fileURLToPath(
						new URL('./src',import.meta.url)
					)
				},
				{
					find:'#i18n',
					replacement:fileURLToPath(
						new URL('./i18n',import.meta.url)
					)
				},
				{
					find:/^#petquery\/(.+)\.js$/,
					replacement:`${petQueryRoot}/$1.ts`
				},
				{
					find:/^#schema\/(.+)\.js$/,
					replacement:`${schemaRoot}/$1.ts`
				},
				{
					find:'@petquery/api-client',
					replacement:fileURLToPath(
						new URL(
							'../packages/api-client/src/index.ts',
							import.meta.url
						)
					)
				}
			]
		},
		plugins:[react(),apiEndpointWriter(envPath,null !== target)],
		// The GUI is served from the origin root.
		base:'/',
		build:{
			outDir:'../dist/gui',
			emptyOutDir:true
		},
		server:{
			host:'127.0.0.1',
			...(null === target ? {} : {
				proxy:{
					'/api':{target,changeOrigin:true},
					'/auth':{target,changeOrigin:true}
				}
			})
		}
	};
});
