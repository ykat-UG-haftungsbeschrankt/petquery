/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins:[react()],
	// The server serves the build at /admin.
	base:'/admin/',
	build:{
		outDir:'../dist/gui',
		emptyOutDir:true
	},
	server:{
		// Forwards API calls to a locally running PetQuery server.
		proxy:{
			'/api':'http://127.0.0.1:50000',
			'/docs':'http://127.0.0.1:50000',
			'/auth':'http://127.0.0.1:50000'
		}
	}
});
