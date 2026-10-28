/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { getProviderLoginUrl } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { useAction } from '#gui/action';
import { useEffect } from 'react';
import { useState } from 'react';

import type { AuthProvider } from '@petquery/api-client';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';

export type LoginProps = {
	providers:Array<AuthProvider>;
	error:utf8_t|null;
	onLogin:(credentials:{
		provider:utf8_t;
		username:utf8_t;
		password:utf8_t;
	})=>Promise<void>;
};

export function Login(props:LoginProps):ReactElement{
	const {busy,error,run} = useAction();
	const [providerName,setProviderName] = useState<utf8_t>('');
	const [username,setUsername] = useState<utf8_t>('');
	const [password,setPassword] = useState<utf8_t>('');
	const message = error ?? props.error;
	const provider = props.providers.find((entry)=>{
		return entry.name === providerName;
	}) ?? props.providers[0] ?? null;

	useEffect(()=>{
		if(null === provider
		|| !props.providers.some((entry)=>{
			return entry.name === providerName;
		})){
			setProviderName(provider?.name ?? '');
		}
	},[provider,providerName,props.providers]);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		if(null === provider
		|| 'redirect' === provider.login){
			return;
		}
		const values = {
			provider:provider.name,
			username:username.trim(),
			password
		};
		if('' === values.username || '' === values.password){
			return;
		}
		run(async ()=>{
			await props.onLogin(values);
			setUsername('');
			setPassword('');
		});
	}

	return (
		<Panel className="login-card">
			<h2>Sign in to PetQuery Admin</h2>
			{null !== message && <pre className="error">{message}</pre>}
			{0 === props.providers.length
				? <p className="muted">No login providers are enabled.</p>
				: <>
					<label className="field">
						<span>Sign-in provider</span>
						<select
							value={provider?.name ?? ''}
							onChange={(event)=>{
								setProviderName(event.target.value);
							}}
						>
							{props.providers.map((entry)=>{
								return (
									<option key={entry.name} value={entry.name}>
										{entry.name}
									</option>
								);
							})}
						</select>
					</label>
					<p className="muted">
						{null === provider
							? ''
							: loginDescription(provider)}
					</p>
					{'redirect' === provider?.login
						? <a
							className="button-link"
							href={getProviderLoginUrl(provider.name)}
						>
							Continue to {provider.name}
						</a>
						: <form className="login-form" onSubmit={onSubmit}>
							<label htmlFor="login-username">
								Username
							</label>
							<input
								id="login-username"
								required
								autoComplete="username"
								value={username}
								onChange={(event)=>{
									setUsername(event.target.value);
								}}
							/>
							<label htmlFor="login-password">
								Password
							</label>
							<input
								id="login-password"
								type="password"
								required
								autoComplete="current-password"
								value={password}
								onChange={(event)=>{
									setPassword(event.target.value);
								}}
							/>
							<Framework7Button
								type="submit"
								disabled={busy}
								fill
							>
								{busy ? 'Signing in...' : 'Sign in'}
							</Framework7Button>
						</form>}
				</>}
		</Panel>
	);
}

function loginDescription(provider:AuthProvider):utf8_t{
	if('redirect' === provider.login){
		return `Continue with ${provider.name}.`;
	}
	return `Sign in with your ${provider.name} account.`;
}
