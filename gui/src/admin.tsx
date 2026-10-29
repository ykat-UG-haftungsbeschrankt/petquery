/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { ApiClients } from '#gui/api-clients';
import { Button } from 'framework7-react';
import { Config } from '#gui/config';
import { Logs } from '#gui/logs';
import { Panel } from '#gui/panel';
import { Pets } from '#gui/pets';
import { Servers } from '#gui/servers';
import { Users } from '#gui/users';
import { useI18n } from '#gui/i18n';
import { useEffect } from 'react';
import { useState } from 'react';

import type { AuthProvider } from '@petquery/api-client';
import type { ReactElement } from 'react';

type AdminPage =
	'home'|'api-clients'|'config'|'logs'|'pets'|'request-logs'
		|'servers'|'users';

const ADMIN_PAGES:Array<{page:AdminPage;label:utf8_t}> = [
	{page:'api-clients',label:'API clients'},
	{page:'config',label:'Config'},
	{page:'logs',label:'Logs'},
	{page:'request-logs',label:'Request logs'},
	{page:'servers',label:'Servers'},
	{page:'users',label:'Users'},
	{page:'pets',label:'Pets'}
];

function readPage(group:'admin'|'user'):AdminPage{
	const base = import.meta.env.BASE_URL;
	const path = window.location.pathname;
	const parts = path.startsWith(base)
		? path.slice(base.length).split('/')
		: [];
	if('admin' === parts[0]){
		if('log' === parts[1]
		&& 'request' === parts[2]
		&& 'get' === parts[3]){
			return 'user' === group ? 'pets' : 'request-logs';
		}
		if('config' === parts[1]
		|| 'api-clients' === parts[1]
		|| 'logs' === parts[1]
		|| 'servers' === parts[1]
		|| 'users' === parts[1]
		|| 'pets' === parts[1]){
			if('user' === group && 'pets' !== parts[1]){
				return 'pets';
			}
			return parts[1];
		}
		return 'home';
	}
	if('config' === parts[0]
	|| 'api-clients' === parts[0]
	|| 'logs' === parts[0]
	|| 'servers' === parts[0]
	|| 'users' === parts[0]
	|| 'pets' === parts[0]){
		if('user' === group && 'pets' !== parts[0]){
			return 'pets';
		}
		return parts[0];
	}
	return 'user' === group ? 'pets' : 'home';
}

function pageUrl(page:AdminPage):utf8_t{
	if('request-logs' === page){
		return `${import.meta.env.BASE_URL}admin/log/request/get`;
	}
	return `${import.meta.env.BASE_URL}admin/${page}`;
}

export function Admin(props:{
	token:utf8_t;
	user:{group:'admin'|'user'};
	providers:Array<AuthProvider>;
}):ReactElement{
	const {t} = useI18n();
	const [page,setPage] = useState<AdminPage>(
		()=>readPage(props.user.group)
	);
	const pages = 'admin' === props.user.group
		? ADMIN_PAGES
		: ADMIN_PAGES.filter((entry)=>{
			return 'pets' === entry.page;
		});

	useEffect(()=>{
		function onPopState():void{
			setPage(readPage(props.user.group));
		}

		window.addEventListener('popstate',onPopState);
		return ()=>{
			window.removeEventListener('popstate',onPopState);
		};
	},[]);

	function onNavigate(next:AdminPage):void{
		if(next !== page){
			window.history.pushState(null,'',pageUrl(next));
			setPage(next);
		}
	}

	let content:ReactElement|null = null;
	if('api-clients' === page){
		content = <ApiClients token={props.token}/>;
	}else if('config' === page){
		content = <Config token={props.token}/>;
	}else if('logs' === page){
		content = <Logs token={props.token}/>;
	}else if('request-logs' === page){
		content = <Logs token={props.token} requestOnly/>;
	}else if('pets' === page){
		content = <Pets token={props.token}/>;
	}else if('servers' === page){
		content = <Servers token={props.token}/>;
	}else if('users' === page){
		content = (
			<Users
				token={props.token}
				providers={props.providers}
			/>
		);
	}

	return (
		<>
			{'home' === page && (
				<Panel className="admin-home">
					<div className="eyebrow">{t('Administration')}</div>
					<h2>{t('Admin')}</h2>
					<p className="muted">
						{t('Configure this server or manage federated peers.')}
					</p>
				</Panel>
			)}
			<nav
				className="admin-nav"
				aria-label={t('Admin sections')}
			>
				{pages.map((entry)=>{
					return (
						<Button
							key={entry.page}
							type="button"
							fill={entry.page === page}
							outline={entry.page !== page}
							onClick={()=>{
								onNavigate(entry.page);
							}}
						>
							{t(entry.label)}
						</Button>
					);
				})}
			</nav>
			{content}
		</>
	);
}
