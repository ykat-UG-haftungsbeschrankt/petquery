/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
	resolve:{
		alias:{
			'#gui':fileURLToPath(new URL('./src',import.meta.url))
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
		// Forwards API calls to a locally running PetQuery server.
		proxy:{
			'/api':'http://127.0.0.1:50000',
			'/docs':'http://127.0.0.1:50000',
			'/openapi':'http://127.0.0.1:50000',
			'/auth':'http://127.0.0.1:50000'
		}
	}
});
