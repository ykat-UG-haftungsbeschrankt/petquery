/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAiSearchHnswIndex } from '#petquery/ai/search/hnsw/index.js';
import { PetQueryAiSearchRank } from '#petquery/ai/search/rank.js';
import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQueryAiSearchImageRecord } from '#petquery/ai/search/database.js';
import type { PetQueryAiSearchMatch } from '#petquery/ai/search/rank.js';
import type { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';

export interface PetQueryAiSearchAnnOptions{
	// Search breadth; higher improves recall at increased cost (default 100).
	efSearch?:size_t;
	// Graph build breadth (default 200).
	efConstruction?:size_t;
	// Connections per node, between 2 and 100 (default 16).
	m?:size_t;
	// Exact-score this many candidates per requested result (default 4).
	oversample?:size_t;
};

interface PetQueryAiSearchSynchronizedIndex{
	readonly index:PetQueryAiSearchHnswIndex;
	readonly sourceId:utf8_t;
	revision:uint_t;
};

// SQLite owns persistence; the graph is a disposable acceleration layer.
export class PetQueryAiSearchAnn extends PetQueryDestructor{
	protected _state:PetQueryAiSearchSynchronizedIndex|undefined;
	protected readonly _options:Required<PetQueryAiSearchAnnOptions>;
	protected readonly _rank:PetQueryAiSearchRank;

	constructor(options:PetQueryAiSearchAnnOptions = {}){
		super();
		this._state = undefined;
		this._rank = new PetQueryAiSearchRank();
		this._options = {
			efSearch: options.efSearch ?? 100,
			efConstruction: options.efConstruction ?? 200,
			m: options.m ?? 16,
			oversample: options.oversample ?? 4,
		};
	}

	public override async _destructor():Promise<void>{
		try{
			await this.clear();
			await this._rank.destructor();
		}
		catch(UNUSED_e){
		}
	}

	knownRevision(model:utf8_t, sourceId:utf8_t = ''):uint_t|undefined{
		this._assertNotDestroyed();
		const state = this._state;
		return state?.index.getModel() === model && state.sourceId === sourceId
			? state.revision : undefined;
	}

	async rebuild(
		images:readonly PetQueryAiSearchImageRecord[],
		revision:uint_t, model:utf8_t, sourceId:utf8_t = '',
	):Promise<void>{
		this._assertNotDestroyed();
		// Publish only after the complete replacement graph has been built.
		const index = new PetQueryAiSearchHnswIndex(images, model, this._options);
		const previous = this._state;
		this._state = { index, revision, sourceId };
		await previous?.index.destructor();
	}

	// False means stale/uninitialized; the next search rebuilds from SQLite.
	async applyMutation(
		upserts:readonly PetQueryAiSearchImageRecord[],
		removedIds:readonly utf8_t[],
		previousRevision:uint_t, revision:uint_t, sourceId:utf8_t,
	):Promise<bool_t>{
		this._assertNotDestroyed();
		const state = this._state;
		if(!state || state.sourceId !== sourceId ||
			state.revision !== previousRevision){
			await this.clear();
			return false;
		}
		for(const image of upserts){
			if(!state.index.accepts(image)){
				await this.clear();
				return false;
			}
		}
		try{
			for(const imageId of removedIds){
				state.index.remove(imageId);
			}
			for(const image of upserts){
				state.index.upsert(image);
			}
			state.revision = revision;
			return true;
		}
		catch(error){
			await this.clear();
			throw new Error(
				'Database mutation committed, but incremental ANN update failed; ' +
				'graph invalidated and will rebuild on search',
				{ cause: error },
			);
		}
	}

	search(
		query:PetQueryAiSearchVector, queryPath:utf8_t,
		model:utf8_t, topK:size_t,
	):PetQueryAiSearchMatch[]{
		this._assertNotDestroyed();
		const candidates = this.searchCandidates(
			query, queryPath, model, topK * this._options.oversample,
		);
		try{
			return this._rank.rank(query, candidates, {
				excludePath: queryPath, topK,
			});
		}
		finally{
			for(const candidate of candidates){
				candidate.vector.destructor();
			}
		}
	}

	searchCandidates(
		query:PetQueryAiSearchVector, queryPath:utf8_t,
		model:utf8_t, candidateCount:size_t,
	):PetQueryAiSearchImageRecord[]{
		this._assertNotDestroyed();
		if(model !== query.getModel()){
			throw new Error(
				'Encoder version mismatch between query and requested model',
			);
		}
		const state = this._state;
		if(!state || model !== state.index.getModel()){
			throw new Error('ANN index has not been synchronized with the encoder');
		}
		return state.index.search(query, queryPath, candidateCount);
	}

	async clear():Promise<void>{
		const state = this._state;
		this._state = undefined;
		await state?.index.destructor();
	}
};
