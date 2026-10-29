/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { getSession } from '@petquery/api-client';
import { setupInitialAdmin } from '@petquery/api-client';
import { Button as Framework7Button } from 'framework7-react';
import { useI18n } from '#gui/i18n';
import { Panel } from '#gui/panel';
import { useAction } from '#gui/action';
import { useState } from 'react';

import type { AuthUser } from '@petquery/api-client';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';

export function Setup(props:{
	onComplete:(user:AuthUser)=>void;
}):ReactElement{
	const {t} = useI18n();
	const {busy,error,run} = useAction();
	const [username,setUsername] = useState<utf8_t>('admin');
	const [password,setPassword] = useState<utf8_t>('');
	const [confirmation,setConfirmation] = useState<utf8_t>('');

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		run(async ()=>{
			if(password !== confirmation){
				throw new Error(t('Passwords do not match'));
			}
			await setupInitialAdmin(username.trim(),password);
			const user = await getSession();
			if(null === user){
				throw new Error(t(
					'Initial setup did not create an admin session'
				));
			}
			setPassword('');
			setConfirmation('');
			props.onComplete(user);
		});
	}

	return (
		<Panel className="login-card">
			<div className="eyebrow">{t('First-time setup')}</div>
			<h2>{t('Create the administrator account')}</h2>
			<p className="muted">
				{t(
					'This server has no local administrator. The first '
					+'client to complete setup becomes the administrator. '
					+'Continue only on a network you trust.'
				)}
			</p>
			{null !== error && <pre className="error">{error}</pre>}
			<form className="login-form" onSubmit={onSubmit}>
				<label htmlFor="setup-username">{t('Username')}</label>
				<input
					id="setup-username"
					required
					minLength={1}
					maxLength={128}
					pattern="[A-Za-z0-9_.@-]+"
					autoComplete="username"
					value={username}
					onChange={(event)=>{
						setUsername(event.target.value);
					}}
				/>
				<label htmlFor="setup-password">{t('Password')}</label>
				<input
					id="setup-password"
					type="password"
					required
					minLength={8}
					maxLength={1024}
					autoComplete="new-password"
					value={password}
					onChange={(event)=>{
						setPassword(event.target.value);
					}}
				/>
				<label htmlFor="setup-confirmation">
					{t('Confirm password')}
				</label>
				<input
					id="setup-confirmation"
					type="password"
					required
					minLength={8}
					maxLength={1024}
					autoComplete="new-password"
					value={confirmation}
					onChange={(event)=>{
						setConfirmation(event.target.value);
					}}
				/>
				<Framework7Button
					type="submit"
					disabled={busy}
					fill
				>
					{busy
						? t('Creating admin...')
						: t('Create admin')}
				</Framework7Button>
			</form>
		</Panel>
	);
}
