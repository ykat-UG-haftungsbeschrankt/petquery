/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useEffect, useState} from 'react';
import type {MouseEvent, ReactElement} from 'react';
import {Config} from './config';
import {Pets} from './pets';
import {Servers} from './servers';
import {Users} from './users';

type AdminPage = 'home'|'config'|'pets'|'servers'|'users';

const ADMIN_PAGES:Array<{page:AdminPage;label:utf8_t}> = [
	{page:'config',label:'Config'},
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
		if('config' === parts[1]
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
	return `${import.meta.env.BASE_URL}admin/${page}`;
}

export function Admin(props:{
	token:utf8_t;
	user:{group:'admin'|'user'};
}):ReactElement{
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

	function onNavigate(
		event:MouseEvent<HTMLAnchorElement>,
		next:AdminPage
	):void{
		if(event.ctrlKey || event.metaKey || event.shiftKey
		|| 0 !== event.button){
			return;
		}
		event.preventDefault();
		if(next !== page){
			window.history.pushState(null,'',pageUrl(next));
			setPage(next);
		}
	}

	let content:ReactElement|null = null;
	if('config' === page){
		content = <Config token={props.token}/>;
	}else if('pets' === page){
		content = <Pets token={props.token}/>;
	}else if('servers' === page){
		content = <Servers token={props.token}/>;
	}else if('users' === page){
		content = <Users token={props.token}/>;
	}

	return (
		<>
			{'home' === page && (
				<section className="admin-home">
					<div className="eyebrow">Administration</div>
					<h2>Admin</h2>
					<p className="muted">
						Configure this server or manage federated peers.
					</p>
				</section>
			)}
			<nav className="admin-nav" aria-label="Admin sections">
				{pages.map((entry)=>{
					return (
						<a
							key={entry.page}
							href={pageUrl(entry.page)}
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
			{content}
		</>
	);
}
