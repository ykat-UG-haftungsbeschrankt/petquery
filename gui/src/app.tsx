/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Admin } from '#gui/admin';
import { ApiEndpointSetup } from '#gui/api-endpoint-setup';
import { App as Framework7App } from 'framework7-react';
import { Button } from 'framework7-react';
import { Docs } from '#gui/docs';
import { getAuthProviders } from '@petquery/api-client';
import { getSession } from '@petquery/api-client';
import { isLanguageSelection } from '#gui/i18n';
import { useI18n } from '#gui/i18n';
import { Login } from '#gui/login';
import { loginUser } from '@petquery/api-client';
import { logout } from '@petquery/api-client';
import { Navbar } from 'framework7-react';
import { NavLeft } from 'framework7-react';
import { NavRight } from 'framework7-react';
import { Page as Framework7Page } from 'framework7-react';
import { Panel } from '#gui/panel';
import { Search } from '#gui/search';
import { Setup } from '#gui/setup';
import { Toolbar } from 'framework7-react';
import { toMessage } from '#gui/action';
import { useEffect } from 'react';
import { useState } from 'react';
import { View } from 'framework7-react';

import type { AuthProvider } from '@petquery/api-client';
import type { AuthUser } from '@petquery/api-client';
import type { ReactElement } from 'react';

const LOGO_URL:utf8_t = `${import.meta.env.BASE_URL}logo.svg`;

type Page = 'search'|'docs'|'admin';

const PAGES:Array<{page:Page;label:utf8_t}> = [
	{page:'search',label:'Home'},
	{page:'docs',label:'Documentation'},
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
	|| 'servers' === name
	|| 'api-clients' === name){
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
	const {
		selection,
		setSelection,
		t
	} = useI18n();
	const [page,setPage] = useState<Page>(readPage);
	const [providers,setProviders] = useState<Array<AuthProvider>>([]);
	const [user,setUser] = useState<AuthUser|null>(null);
	const [checking,setChecking] = useState<bool_t>(true);
	const [apiEndpointRequired,setApiEndpointRequired] =
		useState<bool_t>(false);
	const [setupRequired,setSetupRequired] = useState<bool_t>(false);
	const [authError,setAuthError] = useState<utf8_t|null>(null);
	const token:utf8_t = '';
	const setupInProgress = apiEndpointRequired || setupRequired;

	useEffect(()=>{
		sessionStorage.removeItem('petquery.admin.token');
		sessionStorage.removeItem('petquery.admin.provider');
		let active = true;
		async function restoreSession():Promise<void>{
			if(import.meta.env.DEV){
				const response = await fetch(
					'/__petquery/api-endpoint',
					{cache:'no-store'}
				);
				if(!active){
					return;
				}
				if(!response.ok){
					throw new Error(
						`Vite endpoint status failed: ${response.status}`
					);
				}
				const endpointStatus = await response.text();
				if('missing' === endpointStatus){
					setApiEndpointRequired(true);
					return;
				}
				if('configured' !== endpointStatus){
					throw new Error(
						'Vite API endpoint status is invalid'
					);
				}
			}
			const auth = await getAuthProviders();
			if(!active){
				return;
			}
			setProviders(auth.providers);
			setSetupRequired(auth.setupRequired);
			if(auth.setupRequired){
				return;
			}
			const session = await getSession();
			if(active && null !== session){
				setUser(session);
			}
		}
		restoreSession().catch((error:unknown)=>{
			if(active){
				setAuthError(toMessage(error));
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

	function changePage(next:Page):void{
		if(next !== page){
			window.history.pushState(null,'',pageUrl(next,user));
			setPage(next);
		}
	}

	function onEditPet(gid:utf8_t):void{
		const url = `${import.meta.env.BASE_URL}admin/pets`
			+`?edit=${encodeURIComponent(gid)}`;
		window.history.pushState(null,'',url);
		setPage('admin');
	}

	useEffect(()=>{
		function onPopState():void{
			setPage(readPage());
		}

		window.addEventListener('popstate',onPopState);
		return ()=>{
			window.removeEventListener('popstate',onPopState);
		};
	},[]);

	async function onLogin(credentials:{
		provider:utf8_t;
		username:utf8_t;
		password:utf8_t;
	}):Promise<void>{
		const provider = providers.find((entry)=>{
			return entry.name === credentials.provider;
		});
		if(undefined === provider){
			throw new Error(t(
				'Selected authentication provider is unavailable'
			));
		}
		if('password' !== provider.login){
			throw new Error(t('Selected provider uses redirect sign-in'));
		}
		setUser(await loginUser(
			provider.name,
			credentials.username,
			credentials.password
		));
		setAuthError(null);
	}

	function onSetupComplete(initialUser:AuthUser):void{
		const nextPage = pageUrl('admin',initialUser);
		window.history.replaceState(null,'',nextPage);
		setPage('admin');
		setUser(initialUser);
		setSetupRequired(false);
		setAuthError(null);
	}

	function onLogout():void{
		logout().then(
			()=>clearSession(),
			()=>clearSession()
		);
	}

	function clearSession():void{
		sessionStorage.removeItem('petquery.admin.token');
		sessionStorage.removeItem('petquery.admin.provider');
		setUser(null);
		setAuthError(null);
	}

	let content:ReactElement;
	if(checking){
		content = (
			<Panel className="login-card">
				<p className="muted">{t('Checking your session...')}</p>
			</Panel>
		);
	}else if(apiEndpointRequired){
		content = <ApiEndpointSetup/>;
	}else if(setupRequired){
		content = <Setup onComplete={onSetupComplete}/>;
	}else if('docs' === page){
		content = <Docs/>;
	}else if('search' === page){
		content = <Search token={token} onEdit={onEditPet}/>;
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
		<Framework7App name="PetQuery" theme="auto">
			<View main>
				<Framework7Page>
					<Navbar className="petquery-navbar">
						<NavLeft>
							<Button
								type="button"
								className="brand-button"
								disabled={setupInProgress}
								onClick={()=>{
									changePage('search');
								}}
							>
								<img src={LOGO_URL} alt="PetQuery"/>
							</Button>
						</NavLeft>
						<NavRight>
							<div className="desktop-nav">
								{!setupInProgress && PAGES.map((entry)=>{
									return (
										<Button
											key={entry.page}
											type="button"
											small
											fill={entry.page === page}
											onClick={()=>{
												changePage(entry.page);
											}}
										>
											{t(entry.label)}
										</Button>
									);
								})}
							</div>
							<label className="language-control">
								<select
									aria-label={t('Language')}
									value={selection}
									onChange={(event)=>{
										const value = event.target.value;
										if(isLanguageSelection(value)){
											setSelection(value);
										}
									}}
								>
									<option value="auto">
										{t('Automatic (browser)')}
									</option>
									<option value="en">{t('English')}</option>
									<option value="de">{t('Deutsch')}</option>
								</select>
							</label>
							<div className="auth-controls">
								{checking
									? <span className="auth-state">
										{t('Checking...')}
									</span>
									: setupInProgress
										? <span className="auth-state">
											{t('Initial setup')}
										</span>
										: null !== user
										? <>
											<span className="auth-state">
												{user.displayName}
											</span>
											<Button
												type="button"
												outline
												small
												onClick={onLogout}
											>
												{t('Sign out')}
											</Button>
										</>
										: <span className="auth-state">
											{t('Public')}
										</span>}
							</div>
						</NavRight>
					</Navbar>
					<main
						className={
							'docs' === page
								? 'petquery-content docs-main'
								: 'petquery-content'
						}
					>
						{content}
					</main>
					{!setupInProgress && <Toolbar
						bottom
						className="mobile-tabbar"
					>
						{PAGES.map((entry)=>{
							return (
								<Button
									key={entry.page}
									type="button"
									className="mobile-tab"
									fill={entry.page === page}
									onClick={()=>{
										changePage(entry.page);
									}}
								>
									{t(entry.label)}
								</Button>
							);
						})}
					</Toolbar>}
				</Framework7Page>
			</View>
		</Framework7App>
	);
}
