/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Attachment } from '#gui/attachment';
import { Button as Framework7Button } from 'framework7-react';
import { Panel } from '#gui/panel';
import { searchPets } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useState } from 'react';

import type { ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { SearchResponse } from '@petquery/api-client';
import type { SearchResult } from '@petquery/api-client';

type SearchFeature = {
	title:utf8_t;
	image:utf8_t;
	alt:utf8_t;
	text:utf8_t;
};

const SEARCH_FEATURES:Array<SearchFeature> = [
	{
		title:'Search connected registries',
		image:'feature-registries.svg',
		alt:'Magnifying glass connected to three pet registries',
		text:'One microchip ID is checked across enabled plugins in parallel.'
			+' A slow source never blocks the others.'
	},
	{
		title:'Search by image',
		image:'feature-image-search.svg',
		alt:'A pet photo matched against local records',
		text:'Uploaded pet photos can be matched against local records with'
			+' the built-in AI image search.'
	},
	{
		title:'Share helpful files',
		image:'feature-files.svg',
		alt:'A document with a paw print and upload arrow',
		text:'Photos or documents can also be passed to configured plugins'
			+' when a text-only search is not enough.'
	},
	{
		title:'Federated and loop-safe',
		image:'feature-reunite.svg',
		alt:'Connected PetQuery servers sharing search results',
		text:'Servers can query each other without sharing databases. A'
			+' traceroute helps prevent query loops.'
	},
	{
		title:'Validated and protected',
		image:'feature-api.svg',
		alt:'API brackets surrounding a paw print',
		text:'Incoming and remote data is validated. Management endpoints'
			+' require the appropriate sign-in.'
	},
	{
		title:'Reunite pets and people',
		image:'feature-reunite.svg',
		alt:'Two paws connected by a heart',
		text:'Local records and trusted connected servers can help turn a'
			+' promising match into a happy reunion.'
	},
	{
		title:'Build with the API',
		image:'feature-api.svg',
		alt:'API code brackets surrounding a paw print',
		text:'Use the JSON endpoints to add PetQuery searches to your own'
			+' website, shelter workflow, or rescue tool.'
	}
];

export function Search(props:{token:utf8_t}):ReactElement{
	const {busy,error,run} = useAction();
	const [query,setQuery] = useState<utf8_t>('');
	const [files,setFiles] = useState<Array<File>>([]);
	const [response,setResponse] = useState<SearchResponse|null>(null);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const value = query.trim();
		run(async ()=>{
			if('' === value && 0 === files.length){
				throw new Error('Enter a microchip ID or select files.');
			}
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
			<Panel className="search-card">
				<div className="search-card-content">
					<div className="search-intro">
						<div className="eyebrow">Federated pet lookup</div>
						<h1>Find a pet. Bring them home.</h1>
						<p className="muted">
							Search enabled registries with a microchip ID,
							files, or both.
						</p>
						<div className="search-hero-art" aria-hidden="true">
							<div className="hero-art-glow"></div>
							<img
								src={`${import.meta.env.BASE_URL}`
									+'feature-registries.svg'}
								alt=""
							/>
							<div className="hero-art-caption">
								<span className="hero-art-dot"></span>
								<span>One search across trusted sources</span>
							</div>
						</div>
					</div>
					<div className="search-form-shell">
						<form className="search-form" onSubmit={onSubmit}>
							<label htmlFor="pet-query">Microchip ID</label>
							<div className="search-controls">
								<input
									id="pet-query"
									type="search"
									autoComplete="off"
									placeholder="112093400000465"
									value={query}
									onChange={(event)=>{
										setQuery(event.target.value);
									}}
								/>
							</div>
							<label className="file-field" htmlFor="pet-files">
								Files
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
							<Framework7Button
								className="search-submit"
								type="submit"
								loading={busy}
								disabled={
									busy
									|| ('' === query.trim()
										&& 0 === files.length)
								}
							>
								<span
									className="search-submit-icon"
									aria-hidden="true"
								>
									<svg viewBox="0 0 24 24">
										<circle
											cx="10.5"
											cy="10.5"
											r="6.5"
										/>
										<path d="m16 16 5 5"/>
									</svg>
								</span>
								<span>
									{busy
										? 'Searching...'
										: 'Search for a pet'}
								</span>
							</Framework7Button>
						</form>
					</div>
				</div>
			</Panel>
			{null === response && <Panel className="search-description">
				<div className="eyebrow">
					One tiny chip. A whole lot of hope.
				</div>
				<h2>Why PetQuery?</h2>
				<p>
					When a pet goes missing, people often search only the
					registries close to home. A pet that crosses a border can
					be hard to find.
				</p>
				<p>
					PetQuery is a plugin-based, federated search for pet
					microchip IDs. It checks configured sources in parallel
					and brings the results together.
				</p>
				<h3>Features</h3>
				<div className="description-points">
					<span>Parallel plugin search</span>
					<span>Search by image</span>
					<span>Federated and loop-safe</span>
					<span>Validated I/O</span>
					<span>Share helpful files</span>
					<span>Reunite pets and people</span>
					<span>Build with the API</span>
				</div>
				<div className="feature-grid">
					{SEARCH_FEATURES.map((feature)=>{
						return (
							<article className="feature-card" key={feature.title}>
								<img
									src={`${import.meta.env.BASE_URL}`
										+feature.image}
									alt={feature.alt}
								/>
								<div>
									<h3>{feature.title}</h3>
									<p>{feature.text}</p>
								</div>
							</article>
						);
					})}
				</div>
				<h3>How it works</h3>
				<div className="workflow">
					<div className="workflow-step">
						<strong>1. Send a query</strong>
						<span>Enter a chip ID, add a photo, or do both.</span>
					</div>
					<div className="workflow-arrow" aria-hidden="true">
						&darr;
					</div>
					<div className="workflow-sources">
						<div>Registry plugins</div>
						<div>Local records and AI image search</div>
						<div>Connected PetQuery servers</div>
					</div>
					<div className="workflow-arrow" aria-hidden="true">
						&darr;
					</div>
					<div className="workflow-step">
						<strong>2. Get combined results</strong>
						<span>Matches return together in one response.</span>
					</div>
				</div>
			</Panel>}

			{null !== error && <pre className="error">{error}</pre>}
			{null !== response && <SearchResults response={response}/>}
		</>
	);
}

function SearchResults(props:{response:SearchResponse}):ReactElement{
	const response = props.response;
	return (
		<Panel>
			<div className="page-heading">
				<div>
					<h2>
						Found {response.data.length} result
						{1 === response.data.length ? '' : 's'}
					</h2>
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
		</Panel>
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
			{'' !== result.preview && (
				<img
					className="result-preview"
					src={result.preview}
					alt={`Preview from ${result.source.name}`}
					loading="lazy"
				/>
			)}<h3>{result.name}</h3>
			<p>{result.species} - <code>{result.gid}</code></p>
			{'' !== result.owner_contact && <p>{result.owner_contact}</p>}
			{'' !== result.notes && <p>{result.notes}</p>}
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
			
			<pre className="result-attributes">{attributes}</pre>
			{0 < result.files.length && (
				<ul className="result-files">
					{result.files.map((file,index)=>{
						return (
							<li key={`${file}-${index}`}>
								<Attachment file={file} index={index}/>
							</li>
						);
					})}
				</ul>
			)}
		</article>
	);
}
