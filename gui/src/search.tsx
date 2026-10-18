/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Attachment } from '#gui/attachment';
import { searchPets } from '#gui/api';
import { useAction } from '#gui/action';
import { useState } from 'react';

import type { ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { SearchResponse } from '#gui/api';
import type { SearchResult } from '#gui/api';

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
		text:'One microchip ID can be checked across every enabled registry at'
			+' once. PetQuery gathers the answers and brings them together.'
	},
	{
		title:'Share helpful files',
		image:'feature-files.svg',
		alt:'A document with a paw print and upload arrow',
		text:'Add a photo or document to give registries more context when a'
			+' text-only search is not enough.'
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
					<button
						className="search-submit"
						type="submit"
						aria-busy={busy}
						disabled={busy || '' === query.trim()}
					>
						<span className="search-submit-icon" aria-hidden="true">
							<svg viewBox="0 0 24 24">
								<circle cx="10.5" cy="10.5" r="6.5"/>
								<path d="m16 16 5 5"/>
							</svg>
						</span>
						<span>
							{busy ? 'Searching...' : 'Search for a pet'}
						</span>
					</button>
				</form>
			</section>
			{null === response && <section className="search-description">
				<div className="eyebrow">
					One tiny chip. A whole lot of hope.
				</div>
				<p>
					PetQuery is a friendly, federated pet search. Enter a
					microchip ID to query connected registries at once, add a
					photo or document, and help lost pets find their people.
				</p>
				<div className="description-points">
					<span>Search connected registries</span>
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
			</section>}

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
			{'' !== result.preview && (
				<img
					className="result-preview"
					src={result.preview}
					alt={`Preview from ${result.source.name}`}
					loading="lazy"
				/>
			)}<h3>{result.name}</h3>
			<p>{result.species} - <code>{result.petId}</code></p>
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
