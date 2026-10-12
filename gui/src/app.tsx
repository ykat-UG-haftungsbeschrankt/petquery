/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useEffect, useState} from 'react';
import type {MouseEvent, ReactElement} from 'react';
import {
	authenticate,
	getAuthMode,
	getSession,
	loginUser,
	logout
} from './api';
import type {AuthMode, AuthUser} from './api';
import {Admin} from './admin';
import {Docs} from './docs';
import {Login} from './login';
import {Search} from './search';

const TOKEN_KEY = 'petquery.admin.token';
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
	const [mode,setMode] = useState<AuthMode>('bearer');
	const [token,setToken] = useState<utf8_t>('');
	const [user,setUser] = useState<AuthUser|null>(null);
	const [checking,setChecking] = useState<bool_t>(true);
	const [authError,setAuthError] = useState<utf8_t|null>(null);

	useEffect(()=>{
		const stored = sessionStorage.getItem(TOKEN_KEY) ?? '';
		let active = true;
		async function restoreSession():Promise<void>{
			const nextMode = await getAuthMode();
			if(!active){
				return;
			}
			setMode(nextMode);
			const session = await getSession();
			if(null !== session){
				setUser(session);
				return;
			}
			if('bearer' === nextMode && '' !== stored){
				await authenticate(stored);
				setToken(stored);
				setUser({
					username:'bearer',
					displayName:'Bearer token',
					group:'admin',
					provider:'bearer'
				});
			}
		}
		restoreSession().catch(()=>{
			if(active){
				sessionStorage.removeItem(TOKEN_KEY);
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
		username:utf8_t;
		password:utf8_t;
		token:utf8_t;
	}):Promise<void>{
		if('bearer' === mode){
			await authenticate(credentials.token);
			sessionStorage.setItem(TOKEN_KEY,credentials.token);
			setToken(credentials.token);
			setUser({
				username:'bearer',
				displayName:'Bearer token',
				group:'admin',
				provider:'bearer'
			});
		}else{
			setUser(await loginUser(
				credentials.username,
				credentials.password
			));
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
	}else if(checking){
		content = (
			<section className="login-card">
				<p className="muted">Checking your session...</p>
			</section>
		);
	}else if(null === user){
		content = (
			<Login
				mode={mode}
				error={authError}
				onLogin={onLogin}
			/>
		);
	}else if('search' === page){
		content = <Search token={token}/>;
	}else{
		content = <Admin token={token} user={user}/>;
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
