/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

/// <reference path="../../types/index.d.ts" />

import '#gui/app.css';

import { App } from '#gui/app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = document.getElementById('root');
if(null === root){
	throw new Error('Missing #root element');
}
createRoot(root).render(
	<StrictMode>
		<App/>
	</StrictMode>
);
