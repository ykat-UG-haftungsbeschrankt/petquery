/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useEffect, useState} from 'react';
import type {ChangeEvent, MouseEvent, ReactElement} from 'react';
import {Config} from './config';
import {Servers} from './servers';

// The token is kept for the browser tab only.
const TOKEN_KEY = 'petquery.admin.token';

type Page = 'servers'|'config';

const PAGES:Array<{page:Page;label:utf8_t}> = [
	{page:'config',label:'Config'},
	{page:'servers',label:'Servers'}
];

function readToken():utf8_t{
	return sessionStorage.getItem(TOKEN_KEY) ?? '';
}

// Pages are addressed as /admin/<page>, which the server answers with
// index.html. Anything else shows the servers page.
function readPage():Page{
	const base = import.meta.env.BASE_URL;
	const path = window.location.pathname;
	const name = path.startsWith(base) ? path.slice(base.length) : '';

	return 'config' === name ? 'config' : 'servers';
}

function pageUrl(page:Page):utf8_t{
	return `${import.meta.env.BASE_URL}${page}`;
}

export function App():ReactElement{
	const [token,setToken] = useState<utf8_t>(readToken);
	const [page,setPage] = useState<Page>(readPage);

	useEffect(()=>{
		function onPopState():void{
			setPage(readPage());
		}

		window.addEventListener('popstate',onPopState);
		return ()=>{
			window.removeEventListener('popstate',onPopState);
		};
	},[]);

	function onNavigate(event:MouseEvent<HTMLAnchorElement>,next:Page):void{
		// Let the browser handle opening the page in a new tab or window.
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

	function onTokenChange(event:ChangeEvent<HTMLInputElement>):void{
		setToken(event.target.value);
		sessionStorage.setItem(TOKEN_KEY,event.target.value);
	}

	function onForgetToken():void{
		setToken('');
		sessionStorage.removeItem(TOKEN_KEY);
	}

	return (
		<>
			<header>
				<h1>PetQuery Admin</h1>
				<nav>
					{PAGES.map((entry)=>{
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
				<div className="token-box">
					<input
						type="password"
						autoComplete="off"
						placeholder="Bearer token"
						aria-label="Bearer token"
						value={token}
						onChange={onTokenChange}
					/>
					<button type="button" onClick={onForgetToken}>
						Forget
					</button>
				</div>
			</header>
			<main>
				{'config' === page
					? <Config token={token}/>
					: <Servers token={token}/>}
			</main>
		</>
	);
}
