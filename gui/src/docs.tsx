/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button } from 'framework7-react';
import { Panel } from '#gui/panel';
import { useEffect } from 'react';
import { useState } from 'react';

import type { ReactElement } from 'react';

const DOCS_URL:utf8_t = '/docs/';
const API_URL:utf8_t = '/openapi/';

export function Docs():ReactElement{
	const base = import.meta.env.BASE_URL;
	const [apiSelected,setApiSelected] = useState<bool_t>(
		()=>`${base}docs/api` === window.location.pathname
	);
	const url = apiSelected ? API_URL : DOCS_URL;

	useEffect(()=>{
		function onPopState():void{
			setApiSelected(`${base}docs/api` === window.location.pathname);
		}

		window.addEventListener('popstate',onPopState);
		return ()=>{
			window.removeEventListener('popstate',onPopState);
		};
	},[base]);

	function onNavigate(nextApiSelected:bool_t):void{
		const nextPath = nextApiSelected
			? `${base}docs/api`
			: `${base}docs`;
		if(nextPath !== window.location.pathname){
			window.history.pushState(null,'',nextPath);
			setApiSelected(nextApiSelected);
		}
	}

	return (
		<Panel className="docs-page">
			<nav className="admin-nav" aria-label="Documentation sections">
				<Button
					type="button"
					fill={!apiSelected}
					outline={apiSelected}
					onClick={()=>{
						onNavigate(false);
					}}
				>
					Documentation
				</Button>
				<Button
					type="button"
					fill={apiSelected}
					outline={!apiSelected}
					onClick={()=>{
						onNavigate(true);
					}}
				>
					API
				</Button>
			</nav>
			<iframe
				className="docs-frame"
				title={apiSelected
					? 'PetQuery API reference'
					: 'PetQuery documentation'}
				src={url}
			/>
		</Panel>
	);
}
