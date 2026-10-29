/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import 'framework7/css';
import '#gui/app.css';
import '#gui/custom.css';

import { App } from '#gui/app';
import { I18nProvider } from '#gui/i18n';
import Framework7 from 'framework7/lite';
import Framework7React from 'framework7-react';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

Framework7.use(Framework7React);

const root = document.getElementById('root');
if(null === root){
	throw new Error('Missing #root element');
}
createRoot(root).render(
	<StrictMode>
		<I18nProvider>
			<App/>
		</I18nProvider>
	</StrictMode>
);
