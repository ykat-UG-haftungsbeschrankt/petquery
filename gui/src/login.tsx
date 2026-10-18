/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useEffect, useState} from 'react';
import type {FormEvent, ReactElement} from 'react';
import {getProviderLoginUrl} from './api';
import type {AuthProvider} from './api';
import {useAction} from './action';

export type LoginProps = {
	providers:Array<AuthProvider>;
	error:utf8_t|null;
	onLogin:(credentials:{
		provider:utf8_t;
		username:utf8_t;
		password:utf8_t;
		token:utf8_t;
	})=>Promise<void>;
};

export function Login(props:LoginProps):ReactElement{
	const {busy,error,run} = useAction();
	const [providerName,setProviderName] = useState<utf8_t>('');
	const [token,setToken] = useState<utf8_t>('');
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
			password,
			token:token.trim()
		};
		if('bearer' === provider.login && '' === values.token){
			return;
		}
		if('password' === provider.login
		&& ('' === values.username || '' === values.password)){
			return;
		}
		run(async ()=>{
			await props.onLogin(values);
			setToken('');
			setUsername('');
			setPassword('');
		});
	}

	return (
		<section className="login-card">
			<div className="eyebrow">Protected area</div>
			<h2>Sign in to PetQuery</h2>
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
							{'bearer' === provider?.login
								? <>
									<label htmlFor="login-token">Token</label>
									<input
										id="login-token"
										type="password"
										required
										autoComplete="off"
										value={token}
										onChange={(event)=>{
											setToken(event.target.value);
										}}
									/>
								</>
								: <>
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
								</>}
							<button type="submit" disabled={busy}>
								{busy ? 'Signing in...' : 'Sign in'}
							</button>
						</form>}
				</>}
		</section>
	);
}

function loginDescription(provider:AuthProvider):utf8_t{
	if('bearer' === provider.login){
		return 'Use a configured bearer token to continue.';
	}
	if('redirect' === provider.login){
		return `Continue with ${provider.name}.`;
	}
	return `Sign in with your ${provider.name} account.`;
}
