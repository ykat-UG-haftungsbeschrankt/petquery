/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryAiSearchRank } from '#petquery/ai/search/rank.js';
import { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import hnswlib from 'hnswlib-node';

import type { HierarchicalNSW } from 'hnswlib-node';
import type { PetQueryAiSearchAnnOptions } from '#petquery/ai/search/ann.js';
import type { PetQueryAiSearchImageRecord } from '#petquery/ai/search/database.js';

const MIN_CAPACITY:size_t = 16;
const RANDOM_SEED:uint_t = 100;

// Database revisions are managed by the ANN coordinator.
export class PetQueryAiSearchHnswIndex extends PetQueryDestructor{
	protected _graph:HierarchicalNSW|undefined;
	protected readonly _images:Map<uint_t, PetQueryAiSearchImageRecord>;
	protected readonly _labels:Map<utf8_t, uint_t>;
	protected readonly _paths:Map<utf8_t, size_t>;
	protected _freeLabels:uint_t[];
	protected _nextLabel:uint_t;
	protected readonly _rank:PetQueryAiSearchRank;
	protected readonly _model:utf8_t;
	protected readonly _options:Required<PetQueryAiSearchAnnOptions>;

	constructor(
		images:readonly PetQueryAiSearchImageRecord[],
		model:utf8_t,
		options:Required<PetQueryAiSearchAnnOptions>,
	){
		super();
		this._graph = undefined;
		this._images = new Map();
		this._labels = new Map();
		this._paths = new Map();
		this._freeLabels = [];
		this._nextLabel = 0;
		this._model = model;
		this._options = options;
		const normalized:PetQueryAiSearchImageRecord[] = [];
		try{
			for(const image of images){
				normalized.push(this._normalizeImage(image));
			}
			const dimensions = normalized[0]?.vector.getLength();
			if(undefined !== dimensions){
				for(const image of normalized){
					if(dimensions !== image.vector.getLength()){
						throw new Error(
							`Feature dimension mismatch for image ${image.imageId}; ` +
							're-add it',
						);
					}
				}
				const capacity = Math.max(MIN_CAPACITY, normalized.length);
				const graph = this._createGraph(dimensions, capacity);
				this._graph = graph;
				for(const [label, image] of normalized.entries()){
					graph.addPoint(Array.from(image.vector), label);
					this._storeImage(label, image);
				}
				this._nextLabel = normalized.length;
			}
		}
		catch(error){
			// Constructors cannot await; only synchronous resources exist yet.
			this._releaseGraph();
			throw error;
		}
		finally{
			// Stored vectors have transferred ownership to the graph records.
			for(const [label, image] of normalized.entries()){
				if(this._images.get(label) !== image){
					image.vector.destructor();
				}
			}
		}
		this._rank = new PetQueryAiSearchRank();
	}

	public override async _destructor():Promise<void>{
		try{
			this._releaseGraph();
			await this._rank.destructor();
		}
		catch(UNUSED_e){
		}
	}

	protected _releaseGraph():void{
		try{
			// No native dispose API: drop ownership for GC/native finalization.
			this._graph = undefined;
			for(const image of this._images.values()){
				image.vector.destructor();
			}
			this._images.clear();
			this._labels.clear();
			this._paths.clear();
			this._freeLabels = [];
			this._nextLabel = 0;
		}
		catch(UNUSED_e){
		}
	}

	getModel():utf8_t{
		return this._model;
	}

	accepts(image:PetQueryAiSearchImageRecord):bool_t{
		this._assertNotDestroyed();
		return this._model === image.model &&
			(undefined === this._graph ||
				this._graph.getNumDimensions() === image.vector.getLength());
	}

	remove(imageId:utf8_t):void{
		this._assertNotDestroyed();
		const label = this._labels.get(imageId);
		if(undefined === label){
			return;
		}
		const image = this._imageForLabel(label);
		if(!this._graph){
			throw new Error('Missing ANN record for deletion');
		}
		this._graph.markDelete(label);
		this._labels.delete(imageId);
		this._images.delete(label);
		image.vector.destructor();
		this._freeLabels.push(label);
		this._adjustPath(image.path, -1);
		if(0 === this._images.size){
			this._graph = undefined;
			this._nextLabel = 0;
			this._freeLabels = [];
		}
	}

	upsert(image:PetQueryAiSearchImageRecord):void{
		this._assertNotDestroyed();
		const normalized = this._normalizeImage(image);
		let stored = false;
		try{
			const graph = this._graph ??= this._createGraph(
				normalized.vector.getLength(), MIN_CAPACITY,
			);
			if(graph.getNumDimensions() !== normalized.vector.getLength()){
				throw new Error('Feature dimension mismatch');
			}
			const label = this._labels.get(image.imageId) ??
				this._allocateLabel(graph);
			graph.addPoint(Array.from(normalized.vector), label);
			this._storeImage(label, normalized);
			stored = true;
		}
		finally{
			if(!stored){
				normalized.vector.destructor();
			}
		}
	}

	search(
		query:PetQueryAiSearchVector, queryPath:utf8_t, candidateCount:size_t,
	):PetQueryAiSearchImageRecord[]{
		this._assertNotDestroyed();
		if(!this._graph){
			return [];
		}
		if(this._graph.getNumDimensions() !== query.getLength()){
			throw new Error('Feature dimension mismatch');
		}
		const eligible = this._images.size - (this._paths.get(queryPath) ?? 0);
		if(0 === eligible){
			return [];
		}
		const count = Math.min(eligible, candidateCount);
		if(eligible === count){
			return this._copyCandidates([...this._images.values()], queryPath);
		}
		this._graph.setEf(Math.max(this._options.efSearch, count));
		const result = this._graph.searchKnn(
			Array.from(query), count, this._eligibleLabel.bind(this, queryPath),
		);
		const candidates = result.neighbors.map(this._imageForLabel.bind(this));
		// Heavy churn can disconnect neighborhoods; preserve result cardinality.
		if(candidates.length < count){
			return this._exactCandidates(query, queryPath, count);
		}
		return this._copyCandidates(candidates, queryPath);
	}

	protected _eligibleLabel(queryPath:utf8_t, label:uint_t):bool_t{
		return queryPath !== this._imageForLabel(label).path;
	}

	protected _createGraph(dimensions:size_t, capacity:size_t):HierarchicalNSW{
		const graph = new hnswlib.HierarchicalNSW('cosine', dimensions);
		graph.initIndex(
			capacity, this._options.m, this._options.efConstruction, RANDOM_SEED,
		);
		return graph;
	}

	protected _normalizeImage(
		image:PetQueryAiSearchImageRecord,
	):PetQueryAiSearchImageRecord{
		if(this._model !== image.model ||
			image.model !== image.vector.getModel()){
			throw new Error(
				`Encoder version mismatch for image ${image.imageId}; ` +
				're-add it with the current encoder',
			);
		}
		return { ...image, vector: image.vector.normalize() };
	}

	protected _allocateLabel(graph:HierarchicalNSW):uint_t{
		const reusable = this._freeLabels.pop();
		if(undefined !== reusable){
			graph.unmarkDelete(reusable);
			return reusable;
		}
		if(graph.getMaxElements() <= this._nextLabel){
			graph.resizeIndex(graph.getMaxElements() * 2);
		}
		return this._nextLabel++;
	}

	protected _storeImage(
		label:uint_t, image:PetQueryAiSearchImageRecord,
	):void{
		const previous = this._images.get(label);
		if(previous){
			this._adjustPath(previous.path, -1);
			previous.vector.destructor();
		}
		this._images.set(label, image);
		this._labels.set(image.imageId, label);
		this._adjustPath(image.path, 1);
	}

	protected _adjustPath(path:utf8_t, delta:int_t):void{
		const count = (this._paths.get(path) ?? 0) + delta;
		if(0 === count){
			this._paths.delete(path);
		}
		else{
			this._paths.set(path, count);
		}
	}

	protected _imageForLabel(label:uint_t):PetQueryAiSearchImageRecord{
		const image = this._images.get(label);
		if(!image){
			throw new Error('ANN returned an unknown image label');
		}
		return image;
	}

	protected _copyCandidates(
		images:readonly PetQueryAiSearchImageRecord[], queryPath:utf8_t,
	):PetQueryAiSearchImageRecord[]{
		const candidates:PetQueryAiSearchImageRecord[] = [];
		for(const image of images){
			if(queryPath !== image.path){
				candidates.push({
					...image,
					vector: new PetQueryAiSearchVector(image.vector, image.model),
				});
			}
		}
		return candidates;
	}

	protected _exactCandidates(
		query:PetQueryAiSearchVector, queryPath:utf8_t, count:size_t,
	):PetQueryAiSearchImageRecord[]{
		const images = [...this._images.values()];
		const matches = this._rank.rank(
			query, images, { excludePath: queryPath, topK: count },
		);
		const ids = new Set<utf8_t>();
		for(const match of matches){
			ids.add(match.imageId);
		}
		const selected:PetQueryAiSearchImageRecord[] = [];
		for(const image of images){
			if(ids.has(image.imageId)){
				selected.push(image);
			}
		}
		return this._copyCandidates(selected, queryPath);
	}
};
