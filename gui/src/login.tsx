/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useState} from 'react';
import type {FormEvent, ReactElement} from 'react';
import type {AuthMode} from './api';
import {useAction} from './action';

export type LoginProps = {
	mode:AuthMode;
	error:utf8_t|null;
	onLogin:(
		credentials:{
			username:utf8_t;
			password:utf8_t;
			token:utf8_t;
		}
	)=>Promise<void>;
};

export function Login(props:LoginProps):ReactElement{
	const {busy,error,run} = useAction();
	const [token,setToken] = useState<utf8_t>('');
	const [username,setUsername] = useState<utf8_t>('');
	const [password,setPassword] = useState<utf8_t>('');
	const message = error ?? props.error;

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const values = {
			username:username.trim(),
			password,
			token:token.trim()
		};
		if(props.mode === 'bearer' && '' === values.token){
			return;
		}
		if(props.mode !== 'bearer'
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
			<p className="muted">
				{loginDescription(props.mode)}
			</p>
			{null !== message && <pre className="error">{message}</pre>}
			{'oidc' === props.mode
				? <a
					className="button-link"
					href="/auth/oidc/login"
				>
					Sign in with identity provider
				</a>
				: <form className="login-form" onSubmit={onSubmit}>
					{'bearer' === props.mode
						? <>
							<label htmlFor="login-token">Bearer token</label>
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
							<label htmlFor="login-username">Username</label>
							<input
								id="login-username"
								required
								autoComplete="username"
								value={username}
								onChange={(event)=>{
									setUsername(event.target.value);
								}}
							/>
							<label htmlFor="login-password">Password</label>
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
		</section>
	);
}

function loginDescription(mode:AuthMode):utf8_t{
	if('bearer' === mode){
		return 'Use a configured bearer token to continue.';
	}
	if('oidc' === mode){
		return 'Continue with the configured OpenID Connect provider.';
	}
	return `Sign in with your ${mode.toUpperCase()} account.`;
}
