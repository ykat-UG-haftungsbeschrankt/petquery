/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { Panel } from '#gui/panel';
import { _saveApiEndpoint } from '#gui/api-endpoint';
import { useAction } from '#gui/action';
import { useI18n } from '#gui/i18n';
import { useState } from 'react';

import type { FormEvent } from 'react';
import type { ReactElement } from 'react';

export function ApiEndpointSetup():ReactElement{
	const {t} = useI18n();
	const {busy,error,run} = useAction();
	const [endpoint,setEndpoint] = useState<utf8_t>('');
	const [saved,setSaved] = useState<bool_t>(false);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		setSaved(false);
		run(async ()=>{
			await _saveApiEndpoint(endpoint,t);
			setSaved(true);
		});
	}

	return (
		<Panel className="login-card">
			<div className="eyebrow">{t('First-time setup')}</div>
			<h2>{t('Connect to the PetQuery API')}</h2>
			<p className="muted">
				{t('Enter the origin of the running API server.')}
				{' '}{t(
					'Vite saves the address in gui/.env.local for the local '
					+'proxy.'
				)}
			</p>
			{null !== error && <p className="error" role="alert">{error}</p>}
			{saved && (
				<p className="muted" role="status">
					{t('Endpoint saved. Restart Vite to connect.')}
				</p>
			)}
			<form className="login-form" onSubmit={onSubmit}>
				<label htmlFor="api-endpoint">
					{t('API server origin')}
				</label>
				<input
					id="api-endpoint"
					type="url"
					required
					maxLength={2048}
					autoComplete="url"
					value={endpoint}
					onChange={(event)=>{
						setEndpoint(event.target.value);
					}}
				/>
				<small className="muted">
					{t(
						'Use an HTTP(S) origin without a path, query, or '
						+'credentials.'
					)}
				</small>
				<Framework7Button type="submit" disabled={busy} fill>
					{busy ? t('Saving endpoint...') : t('Save endpoint')}
				</Framework7Button>
			</form>
		</Panel>
	);
}
