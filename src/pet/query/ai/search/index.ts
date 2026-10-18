/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAiSearchRank } from '#petquery/ai/search/rank.js';
import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQueryAiSearchAnn } from '#petquery/ai/search/ann.js';
import type { PetQueryAiSearchDatabase } from '#petquery/ai/search/database.js';
import type { PetQueryAiSearchImageRecord } from '#petquery/ai/search/database.js';
import type { PetQueryAiSearchMatch } from '#petquery/ai/search/rank.js';
import type { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';

export interface PetQueryAiSearchOptions{
	topK?:size_t;
	excludePath?:utf8_t;
};

export interface PetQueryAiSearchCandidateSearchOptions{
	candidateCount?:size_t;
	excludePath?:utf8_t;
};

export interface PetQueryAiSearchIndexedImage{
	groupId:utf8_t;
	imageId:utf8_t;
	vector:PetQueryAiSearchVector;
	path?:utf8_t;
};

// Coordinates durable records and a disposable graph, without image I/O.
export class PetQueryAiSearchIndex extends PetQueryDestructor{
	protected readonly _rank:PetQueryAiSearchRank;
	protected readonly _database:PetQueryAiSearchDatabase;
	protected readonly _ann:PetQueryAiSearchAnn|undefined;

	constructor(
		database:PetQueryAiSearchDatabase, ann?:PetQueryAiSearchAnn,
	){
		super();
		this._rank = new PetQueryAiSearchRank();
		this._database = database;
		this._ann = ann;
	}

	public override async _destructor():Promise<void>{
		try{
			// Database and ANN instances are borrowed from the caller.
			await this._rank.destructor();
		}
		catch(UNUSED_e){
		}
	}

	async add(image:PetQueryAiSearchIndexedImage):Promise<void>{
		this._assertNotDestroyed();
		const path = image.path ??
			`pet-query:image:${encodeURIComponent(image.imageId)}`;
		const normalized:PetQueryAiSearchImageRecord = {
			groupId: image.groupId,
			imageId: image.imageId,
			path,
			model: image.vector.getModel(),
			vector: image.vector.normalize(),
		};
		try{
			const change = this._database.addImageWithRevision(normalized);
			await this._ann?.applyMutation(
				[normalized], [], change.previousRevision, change.revision,
				this._database.sourceId,
			);
		}
		finally{
			normalized.vector.destructor();
		}
	}

	async removeImage(imageId:utf8_t):Promise<bool_t>{
		this._assertNotDestroyed();
		const change = this._database.removeImageWithRevision(imageId);
		await this._ann?.applyMutation(
			[], change.value, change.previousRevision, change.revision,
			this._database.sourceId,
		);
		return change.value.length > 0;
	}

	async removeGroup(groupId:utf8_t):Promise<size_t>{
		this._assertNotDestroyed();
		const change = this._database.removeGroupWithRevision(groupId);
		await this._ann?.applyMutation(
			[], change.value, change.previousRevision, change.revision,
			this._database.sourceId,
		);
		return change.value.length;
	}

	async search(
		query:PetQueryAiSearchVector, options:PetQueryAiSearchOptions = {},
	):Promise<PetQueryAiSearchMatch[]>{
		this._assertNotDestroyed();
		const topK = options.topK ?? 10;
		const feature = query.normalize();
		try{
			const queryPath = options.excludePath ?? '';
			if(!this._ann){
				const images = this._database.images();
				try{
					return this._rank.rank(feature, images, options);
				}
				finally{
					this._releaseImages(images);
				}
			}
			await this._synchronize(query.getModel());
			this._assertNotDestroyed();
			return this._ann.search(feature, queryPath, query.getModel(), topK);
		}
		finally{
			feature.destructor();
		}
	}

	async searchCandidates(
		query:PetQueryAiSearchVector,
		options:PetQueryAiSearchCandidateSearchOptions = {},
	):Promise<PetQueryAiSearchImageRecord[]>{
		this._assertNotDestroyed();
		const count = options.candidateCount ?? 100;
		const feature = query.normalize();
		try{
			const path = options.excludePath ?? '';
			if(this._ann){
				await this._synchronize(query.getModel());
				this._assertNotDestroyed();
				return this._ann.searchCandidates(
					feature, path, query.getModel(), count,
				);
			}
			return this._exactCandidates(feature, path, count);
		}
		finally{
			feature.destructor();
		}
	}

	protected _exactCandidates(
		feature:PetQueryAiSearchVector, path:utf8_t, count:size_t,
	):PetQueryAiSearchImageRecord[]{
		const images = this._database.images();
		const retained = new Set<PetQueryAiSearchImageRecord>();
		try{
			const ranked = this._rank.rank(
				feature, images, { topK: count, excludePath: path },
			);
			const byId = new Map<utf8_t, PetQueryAiSearchImageRecord>();
			for(const image of images){
				byId.set(image.imageId, image);
			}
			const candidates:PetQueryAiSearchImageRecord[] = [];
			for(const match of ranked){
				const image = byId.get(match.imageId);
				if(!image){
					throw new Error('Missing candidate in database snapshot');
				}
				candidates.push(image);
			}
			for(const image of candidates){
				retained.add(image);
			}
			return candidates;
		}
		finally{
			for(const image of images){
				if(!retained.has(image)){
					image.vector.destructor();
				}
			}
		}
	}

	protected async _synchronize(model:utf8_t):Promise<void>{
		if(!this._ann){
			return;
		}
		const sourceId = this._database.sourceId;
		const revision = this._ann.knownRevision(model, sourceId);
		const snapshot = this._database.snapshot(revision);
		if(undefined !== snapshot.images){
			try{
				await this._ann.rebuild(
					snapshot.images, snapshot.revision, model, sourceId,
				);
			}
			finally{
				this._releaseImages(snapshot.images);
			}
		}
	}

	protected _releaseImages(images:readonly PetQueryAiSearchImageRecord[]):void{
		for(const image of images){
			image.vector.destructor();
		}
	}
};
