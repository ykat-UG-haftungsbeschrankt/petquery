/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useState} from 'react';
import type {ChangeEvent, FormEvent, ReactElement} from 'react';
import {searchPets} from './api';
import type {SearchResponse, SearchResult} from './api';
import {useAction} from './action';

export function Search(props:{token:utf8_t}):ReactElement{
	const {busy,error,run} = useAction();
	const [query,setQuery] = useState<utf8_t>('');
	const [files,setFiles] = useState<Array<File>>([]);
	const [response,setResponse] = useState<SearchResponse|null>(null);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const value = query.trim();
		if('' === value){
			return;
		}
		run(async ()=>{
			setResponse(await searchPets(props.token,value,files));
		});
	}

	function onFilesChange(event:ChangeEvent<HTMLInputElement>):void{
		setFiles(
			null === event.target.files
				? []
				: Array.from(event.target.files)
		);
	}

	return (
		<>
			<section className="search-card">
				<div className="eyebrow">Federated pet lookup</div>
				<h2>Find a pet</h2>
				<p className="muted">
					Search every enabled registry with one microchip ID.
				</p>
				<form className="search-form" onSubmit={onSubmit}>
					<label htmlFor="pet-query">Microchip ID</label>
					<div className="search-controls">
						<input
							id="pet-query"
							type="search"
							required
							autoComplete="off"
							placeholder="112093400000465"
							value={query}
							onChange={(event)=>{
								setQuery(event.target.value);
							}}
						/>
						<button
							type="submit"
							disabled={busy || '' === query.trim()}
						>
							{busy ? 'Searching...' : 'Search'}
						</button>
					</div>
					<label className="file-field" htmlFor="pet-files">
						Supporting files
					</label>
					<input
						id="pet-files"
						className="file-input"
						type="file"
						multiple
						onChange={onFilesChange}
					/>
					{0 < files.length && (
						<ul className="selected-files">
							{files.map((file,index)=>{
								return (
									<li key={`${file.name}-${index}`}>
										{file.name}
									</li>
								);
							})}
						</ul>
					)}
				</form>
			</section>

			{null !== error && <pre className="error">{error}</pre>}
			{null !== response && <SearchResults response={response}/>}
		</>
	);
}

function SearchResults(props:{response:SearchResponse}):ReactElement{
	const response = props.response;
	return (
		<section>
			<div className="page-heading">
				<div>
					<h2>Results</h2>
					<p className="muted">
						{response.data.length} result
						{1 === response.data.length ? '' : 's'} returned.
					</p>
				</div>
				<span className={
					response.success ? 'status status-ok' : 'status status-warn'
				}>
					{response.success ? 'Complete' : 'Partial'}
				</span>
			</div>
			{0 < response.error.length && (
				<div className="result-errors">
					<strong>Some registries reported errors</strong>
					<ul>
						{response.error.map((message,index)=>{
							return <li key={`${message}-${index}`}>{message}</li>;
						})}
					</ul>
				</div>
			)}
			{0 === response.data.length
				? <p className="muted">No matching pet was found.</p>
				: <div className="search-results">
					{response.data.map((result,index)=>{
						return (
							<SearchResultCard
								key={`${result.source.name}-${index}`}
								result={result}
							/>
						);
					})}
				</div>}
		</section>
	);
}

function SearchResultCard(props:{result:SearchResult}):ReactElement{
	const result = props.result;
	const source = '' === result.source.url
		? <span>{result.source.name}</span>
		: <a
			href={result.source.url}
			target="_blank"
			rel="noreferrer"
		>
			{result.source.name}
		</a>;
	const attributes = JSON.stringify(result.attributes,null,2) ?? '';

	return (
		<article className="result-card">
			<div className="result-source">
				{'' !== result.source.favicon && (
					<img
						src={result.source.favicon}
						alt=""
						loading="lazy"
					/>
				)}
				{source}
			</div>
			{'' !== result.preview && (
				<img
					className="result-preview"
					src={result.preview}
					alt={`Preview from ${result.source.name}`}
					loading="lazy"
				/>
			)}
			<pre className="result-attributes">{attributes}</pre>
			{0 < result.files.length && (
				<ul className="result-files">
					{result.files.map((file,index)=>{
						return (
							<li key={`${file}-${index}`}>
								<a
									href={file}
									target="_blank"
									rel="noreferrer"
								>
									Attached file {index + 1}
								</a>
							</li>
						);
					})}
				</ul>
			)}
		</article>
	);
}
