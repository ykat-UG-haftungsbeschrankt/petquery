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

export default defineConfig(({mode})=>{
	const guiRoot = fileURLToPath(new URL('.',import.meta.url));
	const env = loadEnv(mode,guiRoot,'PETQUERY_');
	const apiTarget = env.PETQUERY_API_URL;
	if(undefined === apiTarget || '' === apiTarget){
		throw new Error(
			'Set PETQUERY_API_URL in gui/.env.local to the backend origin'
		);
	}
	const apiUrl = URL.canParse(apiTarget)
		? new URL(apiTarget)
		: null;
	if(null === apiUrl
	|| ('http:' !== apiUrl.protocol && 'https:' !== apiUrl.protocol)
	|| '/' !== apiUrl.pathname
	|| '' !== apiUrl.search
	|| '' !== apiUrl.hash
	|| '' !== apiUrl.username
	|| '' !== apiUrl.password){
		throw new Error(
			'PETQUERY_API_URL must be an HTTP(S) origin in gui/.env.local'
		);
	}
	const target = apiUrl.origin;

	return {
		resolve:{
			alias:{
				'#gui':fileURLToPath(new URL('./src',import.meta.url)),
				'@petquery/api-client':fileURLToPath(
					new URL(
						'../packages/api-client/src/index.ts',
						import.meta.url
					)
				)
			}
			},
		plugins:[react()],
		// The server serves the build at /gui.
		base:'/gui/',
		build:{
			outDir:'../dist/gui',
			emptyOutDir:true
		},
		server:{
			// Forward API, auth, docs, and OpenAPI to the configured server.
			proxy:{
				'/api':{target,changeOrigin:true},
				'/docs':{target,changeOrigin:true},
				'/openapi':{target,changeOrigin:true},
				'/auth':{target,changeOrigin:true}
			}
		}
	};
});
