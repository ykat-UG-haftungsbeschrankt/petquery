/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useEffect, useState} from 'react';
import type {MouseEvent, ReactElement} from 'react';
import {
	getAuthProviders,
	getSession,
	loginUser,
	logout
} from './api';
import type {AuthProvider, AuthUser} from './api';
import {Admin} from './admin';
import {Docs} from './docs';
import {Login} from './login';
import {Search} from './search';

const TOKEN_KEY = 'petquery.admin.token';
const PROVIDER_KEY = 'petquery.admin.provider';
const LOGO_URL:utf8_t = `${import.meta.env.BASE_URL}logo.svg`;

type Page = 'search'|'docs'|'admin';

const PAGES:Array<{page:Page;label:utf8_t}> = [
	{page:'search',label:'Home'},
	{page:'docs',label:'Docs'},
	{page:'admin',label:'Admin'}
];

function readPage():Page{
	const base = import.meta.env.BASE_URL;
	const path = window.location.pathname;
	const parts = path.startsWith(base)
		? path.slice(base.length).split('/')
		: [];
	const name = parts[0];
	if('admin' === name && 'search' === parts[1]){
		return 'search';
	}
	if('docs' === name){
		return 'docs';
	}
	if('admin' === name
	|| 'config' === name
	|| 'servers' === name){
		return 'admin';
	}
	if('search' === name){
		return 'search';
	}
	return 'search';
}

function pageUrl(page:Page,user:AuthUser|null):utf8_t{
	const base = import.meta.env.BASE_URL;
	if('search' === page){
		return `${base}search`;
	}
	if('admin' === page){
		const section = null !== user && 'user' === user.group
			? 'pets'
			: 'config';
		return `${base}admin/${section}`;
	}
	return `${base}${page}`;
}

export function App():ReactElement{
	const [page,setPage] = useState<Page>(readPage);
	const [providers,setProviders] = useState<Array<AuthProvider>>([]);
	const [token,setToken] = useState<utf8_t>('');
	const [user,setUser] = useState<AuthUser|null>(null);
	const [checking,setChecking] = useState<bool_t>(true);
	const [authError,setAuthError] = useState<utf8_t|null>(null);

	useEffect(()=>{
		const stored = sessionStorage.getItem(TOKEN_KEY) ?? '';
		const storedProvider =
			sessionStorage.getItem(PROVIDER_KEY) ?? 'bearer';
		let active = true;
		async function restoreSession():Promise<void>{
			const auth = await getAuthProviders();
			if(!active){
				return;
			}
			setProviders(auth.providers);
			const session = await getSession();
			if(null !== session){
				setUser(session);
				return;
			}
			if(auth.providers.some((provider)=>{
				return provider.name === storedProvider
					&& 'bearer' === provider.login;
			}) && '' !== stored){
				const authenticated = await loginUser(
					storedProvider,
					'',
					'',
					stored
				);
				setToken(stored);
				setUser({
					username:'bearer',
					displayName:'Bearer token',
					group:'admin',
					provider:storedProvider
				});
				setUser(authenticated);
			}
		}
		restoreSession().catch(()=>{
			if(active){
				sessionStorage.removeItem(TOKEN_KEY);
				sessionStorage.removeItem(PROVIDER_KEY);
				setAuthError('Your saved session has expired.');
			}
		}).finally(()=>{
			if(active){
				setChecking(false);
			}
		});
		return ()=>{
			active = false;
		};
	},[]);

	function onNavigate(
		event:MouseEvent<HTMLAnchorElement>,
		next:Page
	):void{
		if('docs' === next){
			return;
		}
		if(event.ctrlKey || event.metaKey || event.shiftKey
		|| 0 !== event.button){
			return;
		}
		event.preventDefault();
		if(next !== page){
			window.history.pushState(null,'',pageUrl(next,user));
			setPage(next);
		}
	}

	async function onLogin(credentials:{
		provider:utf8_t;
		username:utf8_t;
		password:utf8_t;
		token:utf8_t;
	}):Promise<void>{
		const provider = providers.find((entry)=>{
			return entry.name === credentials.provider;
		});
		if(undefined === provider){
			throw new Error('Selected authentication provider is unavailable');
		}
		if('bearer' === provider.login){
			const authenticated = await loginUser(
				provider.name,
				'',
				'',
				credentials.token
			);
			sessionStorage.setItem(TOKEN_KEY,credentials.token);
			sessionStorage.setItem(PROVIDER_KEY,provider.name);
			setToken(credentials.token);
			setUser({
				username:'bearer',
				displayName:'Bearer token',
				group:'admin',
				provider:'bearer'
			});
			setUser(authenticated);
		}else if('password' === provider.login){
			sessionStorage.removeItem(TOKEN_KEY);
			sessionStorage.removeItem(PROVIDER_KEY);
			setToken('');
			setUser(await loginUser(
				provider.name,
				credentials.username,
				credentials.password
			));
		}else{
			throw new Error('Selected provider uses redirect sign-in');
		}
		setAuthError(null);
	}

	function onLogout():void{
		logout().then(
			()=>clearSession(),
			()=>clearSession()
		);
	}

	function clearSession():void{
		sessionStorage.removeItem(TOKEN_KEY);
		sessionStorage.removeItem(PROVIDER_KEY);
		setToken('');
		setUser(null);
		setAuthError(null);
	}

	function pageUrlWithUser(next:Page):utf8_t{
		return pageUrl(next,user);
	}

	let content:ReactElement;
	if('docs' === page){
		content = <Docs/>;
	}else if('search' === page){
		content = <Search token={token}/>;
	}else if(checking){
		content = (
			<section className="login-card">
				<p className="muted">Checking your session...</p>
			</section>
		);
	}else if(null === user){
		content = (
			<Login
				providers={providers}
				error={authError}
				onLogin={onLogin}
			/>
		);
	}else{
		content = (
			<Admin
				token={token}
				user={user}
				providers={providers}
			/>
		);
	}

	return (
		<>
			<header>
				<h1 className="brand">
					<a
						className="brand-link"
						href={pageUrlWithUser('search')}
						onClick={(event)=>{
							onNavigate(event,'search');
						}}
					>
						<img src={LOGO_URL} alt="PetQuery"/>
					</a>
				</h1>
				<nav aria-label="Primary navigation">
					{PAGES.map((entry)=>{
						return (
							<a
								key={entry.page}
								href={pageUrlWithUser(entry.page)}
								aria-current={
									entry.page === page ? 'page' : undefined
								}
								onClick={(event)=>{
									onNavigate(event,entry.page);
								}}
							>
								{entry.label}
							</a>
						);
					})}
				</nav>
				<div className="auth-controls">
					{checking
						? <span className="auth-state">Checking...</span>
						: null !== user
							? <>
								<span className="auth-state">
									{user.displayName}
								</span>
								<button
									type="button"
									onClick={onLogout}
								>
									Sign out
								</button>
							</>
							: <span className="auth-state">Public</span>}
				</div>
			</header>
			<main>{content}</main>
		</>
	);
}
