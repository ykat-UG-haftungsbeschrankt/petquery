/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { getLogEntries } from '@petquery/api-client';
import { getRequestLogEntries } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { FormEvent } from 'react';
import type { LogEntry } from '@petquery/api-client';
import type { LogLevel } from '@petquery/api-client';
import type { ReactElement } from 'react';

const LOG_LEVELS:Array<LogLevel> = [
	'error',
	'warn',
	'info',
	'debug'
];

function isLogLevel(value:utf8_t):value is LogLevel{
	return 'error' === value
		|| 'warn' === value
		|| 'info' === value
		|| 'debug' === value;
}

export function Logs(props:{
	token:utf8_t;
	requestOnly?:bool_t;
}):ReactElement{
	const {busy,error,run} = useAction();
	const [entries,setEntries] = useState<Array<LogEntry>>([]);
	const [level,setLevel] = useState<LogLevel|'all'>('all');
	const [query,setQuery] = useState<utf8_t>('');

	const load = useCallback(async (
		selectedLevel:LogLevel|'all',
		search:utf8_t
	):Promise<void>=>{
		const result = props.requestOnly
			? await getRequestLogEntries(props.token,search,100)
			: await getLogEntries(
				props.token,
				'all' === selectedLevel ? undefined : selectedLevel,
				search,
				100
			);
		setEntries(result);
	},[props.requestOnly,props.token]);

	useEffect(()=>{
		run(async ()=>{
			await load('all','');
		});
	},[run,load]);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		run(async ()=>{
			await load(level,query.trim());
		});
	}

	return (
		<Panel>
			<h2>{props.requestOnly ? 'Request logs' : 'Logs'}</h2>
			<p className="muted">
				{props.requestOnly
					? 'Showing up to 100 newest requests. '
						+'Query strings and bodies are not recorded.'
					: 'Showing up to 100 newest log entries.'}
			</p>
			<form
				className={props.requestOnly
					? 'log-filters log-filters-request'
					: 'log-filters'}
				onSubmit={onSubmit}
			>
				{!props.requestOnly && (
					<label className="field">
						<span>Level</span>
						<select
							value={level}
							onChange={(event)=>{
								const value = event.target.value;
								if('all' === value){
									setLevel('all');
								}else if(isLogLevel(value)){
									setLevel(value);
								}
							}}
						>
							<option value="all">All levels</option>
							{LOG_LEVELS.map((value)=>{
								return (
									<option key={value} value={value}>
										{value}
									</option>
								);
							})}
						</select>
					</label>
				)}
				<label className="field">
					<span>{props.requestOnly
						? 'Search request lines'
						: 'Search message'}</span>
					<input
						type="search"
						maxLength={256}
						value={query}
						onChange={(event)=>{
							setQuery(event.target.value);
						}}
					/>
				</label>
				<Framework7Button
					type="submit"
					fill
					disabled={busy}
				>
					{busy ? 'Loading...' : props.requestOnly
						? 'Search requests'
						: 'Search logs'}
				</Framework7Button>
			</form>
			{null !== error && (
				<p className="error" role="alert">{error}</p>
			)}
			{0 < entries.length
				? <div className="log-entries" aria-live="polite">
					{entries.map((entry,index)=>{
						return (
							<article
								className={`log-entry log-level-${entry.level}`}
								key={`${entry.timestamp}-${index}`}
							>
								<div className="log-entry-meta">
									<strong>{entry.level}</strong>
									<time dateTime={entry.timestamp}>
										{new Date(
											entry.timestamp
										).toLocaleString()}
									</time>
								</div>
								<pre>{entry.message}</pre>
							</article>
						);
					})}
				</div>
				: !busy && null === error
					? <p className="muted">
						{props.requestOnly
							? 'No matching request logs.'
							: 'No matching log entries.'}
					</p>
					: null}
		</Panel>
	);
}
