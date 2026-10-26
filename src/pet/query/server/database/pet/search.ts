/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { createHash } from 'node:crypto';
import { PetQueryAiSearchAnn } from '#petquery/ai/search/ann.js';
import { PetQueryAiSearchDatabase } from '#petquery/ai/search/database.js';
import { PetQueryAiSearchEncoder } from '#petquery/ai/search/encoder.js';
import { PetQueryAiSearchImage } from '#petquery/ai/search/image.js';
import { PetQueryAiSearchIndex } from '#petquery/ai/search/index.js';
import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQueryAiSearchImageRecord } from '#petquery/ai/search/database.js';
import type { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';
import type { PetQuerySchemaPluginFileType } from '#schema/plugin/file.js';
import type { PetQuerySchemaServerDatabasePetEntryType } from '#schema/server/database/pet/entry.js';

type PetQueryServerDatabasePetSearchCandidate = {
	groupId:utf8_t;
	imageId:utf8_t;
	path:utf8_t;
	digest:utf8_t;
	image:PetQueryAiSearchImage;
	vector:PetQueryAiSearchVector|undefined;
};

type PetQueryServerDatabasePetSearchScore = {
	groupId:utf8_t;
	relevanceScore:float64_t;
};

const DATA_IMAGE_PREFIX =
	/^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,/i;
const BASE64_CONTENT =
	/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const IMAGE_MIME_TYPES = new Set<utf8_t>([
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'image/avif',
	'image/bmp'
]);
const SEARCH_TOP_K:size_t = 50;

export class PetQueryServerDatabasePetSearch extends PetQueryDestructor{
	protected readonly _database:PetQueryAiSearchDatabase;
	protected readonly _encoder:PetQueryAiSearchEncoder;
	protected readonly _ann:PetQueryAiSearchAnn;
	protected readonly _index:PetQueryAiSearchIndex;
	protected _generation:uint_t;
	protected _indexedGeneration:uint_t|undefined;
	protected _candidateCount:size_t;
	protected _rebuilding:Promise<void>|undefined;

	constructor(path:utf8_t){
		super();
		this._database = new PetQueryAiSearchDatabase(path);
		this._encoder = new PetQueryAiSearchEncoder();
		this._ann = new PetQueryAiSearchAnn();
		this._index = new PetQueryAiSearchIndex(
			this._database,
			this._ann
		);
		this._generation = 0;
		this._indexedGeneration = undefined;
		this._candidateCount = 0;
		this._rebuilding = undefined;
	}

	public override async _destructor():Promise<void>{
		try{
			await Promise.allSettled([
				this._index.destructor(),
				this._ann.destructor(),
				this._encoder.destructor(),
				this._database.destructor()
			]);
		}
		catch(UNUSED_e){
		}
	}

	_invalidate():void{
		this._assertNotDestroyed();
		this._generation++;
	}

	async _searchByFile(
		files:readonly PetQuerySchemaPluginFileType[],
		loadPets:()=>Promise<PetQuerySchemaServerDatabasePetEntryType[]>
	):Promise<PetQuerySchemaServerDatabasePetEntryType[]>{
		this._assertNotDestroyed();
		const queryImages = await this._createQueryImages(files);
		let queryVectors:Array<PetQueryAiSearchVector>|undefined;
		try{
			if(0 === queryImages.length){
				return [];
			}
			while(true){
				this._assertNotDestroyed();
				const generation = this._generation;
				const pets = await loadPets();
				this._assertNotDestroyed();
				if(generation !== this._generation){
					continue;
				}
				await this._synchronize(pets,generation);
				this._assertNotDestroyed();
				if(generation !== this._generation
				|| generation !== this._indexedGeneration){
					continue;
				}
				if(0 === this._candidateCount){
					return [];
				}
				if(undefined === queryVectors){
					queryVectors = await this._encoder.encodeBatch(
						queryImages
					);
				}
				if(generation !== this._generation){
					continue;
				}
				const results = await this._search(queryVectors,pets);
				if(generation !== this._generation){
					continue;
				}
				return results;
			}
		}
		finally{
			if(undefined !== queryVectors){
				for(const vector of queryVectors){
					vector.destructor();
				}
			}
			await this._releaseImages(queryImages);
		}
	}

	protected async _createQueryImages(
		files:readonly PetQuerySchemaPluginFileType[]
	):Promise<Array<PetQueryAiSearchImage>>{
		const images:Array<PetQueryAiSearchImage> = [];
		try{
			for(const file of files){
				const mime = file.mime.split(';',1)[0]?.toLowerCase() ?? '';
				if(!IMAGE_MIME_TYPES.has(mime)){
					continue;
				}
				const image = this._decodeBase64(file.data);
				images.push(image);
				const buffer = image.toBuffer();
				try{
					if(file.size !== buffer.length){
						throw new Error(
							`Uploaded image "${file.filename}" size mismatch`
						);
					}
				}
				finally{
					buffer.fill(0);
				}
			}
			return images;
		}
		catch(error){
			await this._releaseImages(images);
			throw error;
		}
	}

	protected _decodeBase64(
		value:utf8_t
	):PetQueryAiSearchImage{
		if(0 === value.length || !BASE64_CONTENT.test(value)){
			throw new Error('Invalid base64 image data');
		}
		return PetQueryAiSearchImage.fromBase64(value);
	}

	protected _decodeDataImage(
		value:utf8_t
	):PetQueryAiSearchImage|undefined{
		const prefix = DATA_IMAGE_PREFIX.exec(value);
		if(null === prefix){
			return undefined;
		}
		return this._decodeBase64(value.slice(prefix[0].length));
	}

	protected _imageDigest(image:PetQueryAiSearchImage):utf8_t{
		const buffer = image.toBuffer();
		try{
			return createHash('sha256').update(buffer).digest('hex');
		}
		finally{
			buffer.fill(0);
		}
	}

	protected async _collectCandidates(
		pets:readonly PetQuerySchemaServerDatabasePetEntryType[]
	):Promise<Array<PetQueryServerDatabasePetSearchCandidate>>{
		const candidates:Array<PetQueryServerDatabasePetSearchCandidate> = [];
		try{
			for(const pet of pets){
				const sources:Array<{key:utf8_t;uri:utf8_t}> = [
					{key:'preview',uri:pet.preview}
				];
				for(const [index, uri] of pet.files.entries()){
					sources.push({key:`file-${index}`,uri});
				}
				for(const source of sources){
					const image = this._decodeDataImage(source.uri);
					if(undefined === image){
						continue;
					}
					const path = `pet-query:pet:`
						+`${encodeURIComponent(pet.gid)}:${source.key}`;
					const candidate:PetQueryServerDatabasePetSearchCandidate = {
						groupId:pet.gid,
						imageId:`${pet.gid}:${source.key}`,
						path,
						digest:'',
						image,
						vector:undefined
					};
					candidates.push(candidate);
					candidate.digest = this._imageDigest(image);
					candidate.vector = this._database.get(
						path,
						this._encoder.cacheKey,
						candidate.digest
					);
				}
			}
			return candidates;
		}
		catch(error){
			await this._releaseCandidates(candidates);
			throw error;
		}
	}

	protected async _synchronize(
		pets:readonly PetQuerySchemaServerDatabasePetEntryType[],
		generation:uint_t
	):Promise<void>{
		if(generation === this._indexedGeneration){
			return;
		}
		const rebuilding = this._rebuilding;
		if(undefined !== rebuilding){
			await rebuilding;
			return;
		}
		const operation = this._rebuild(pets);
		this._rebuilding = operation;
		try{
			await operation;
			if(generation === this._generation){
				this._indexedGeneration = generation;
			}
		}
		finally{
			if(operation === this._rebuilding){
				this._rebuilding = undefined;
			}
		}
	}

	protected async _rebuild(
		pets:readonly PetQuerySchemaServerDatabasePetEntryType[]
	):Promise<void>{
		const candidates = await this._collectCandidates(pets);
		const ownedVectors:Array<PetQueryAiSearchVector> = [];
		for(const candidate of candidates){
			if(undefined !== candidate.vector){
				ownedVectors.push(candidate.vector);
			}
		}
		let existing:PetQueryAiSearchImageRecord[] = [];
		try{
			existing = this._database.images();
			const candidatePaths = new Set<utf8_t>();
			for(const candidate of candidates){
				candidatePaths.add(candidate.path);
			}
			const groups = new Set<utf8_t>();
			for(const image of existing){
				groups.add(image.groupId);
				if(image.model !== this._encoder.cacheKey
				|| !candidatePaths.has(image.path)){
					this._database._removeFeature(image.path,image.model);
				}
			}
			for(const groupId of groups){
				await this._index.removeGroup(groupId);
			}
			const missing:Array<PetQueryServerDatabasePetSearchCandidate> = [];
			for(const candidate of candidates){
				if(undefined === candidate.vector){
					missing.push(candidate);
				}
			}
			if(0 < missing.length){
				const encoded = await this._encoder.encodeBatch(
					missing.map((candidate)=>{
						return candidate.image;
					})
				);
				ownedVectors.push(...encoded);
				for(const [index, candidate] of missing.entries()){
					const vector = encoded[index];
					if(undefined === vector){
						throw new Error(
							'AI encoder returned an incomplete image batch'
						);
					}
					candidate.vector = vector;
					this._database.put(
						candidate.path,
						this._encoder.cacheKey,
						candidate.digest,
						vector
					);
				}
			}
			for(const candidate of candidates){
				const vector = candidate.vector;
				if(undefined === vector){
					throw new Error('AI encoder returned no image feature');
				}
				await this._index.add({
					groupId:candidate.groupId,
					imageId:candidate.imageId,
					path:candidate.path,
					vector
				});
			}
			this._candidateCount = candidates.length;
		}
		finally{
			for(const image of existing){
				image.vector.destructor();
			}
			for(const vector of ownedVectors){
				vector.destructor();
			}
			const images:Array<PetQueryAiSearchImage> = [];
			for(const candidate of candidates){
				images.push(candidate.image);
			}
			await this._releaseImages(images);
		}
	}

	protected async _search(
		vectors:readonly PetQueryAiSearchVector[],
		pets:readonly PetQuerySchemaServerDatabasePetEntryType[]
	):Promise<PetQuerySchemaServerDatabasePetEntryType[]>{
		const scores = new Map<utf8_t,float64_t>();
		const topK = Math.min(SEARCH_TOP_K,this._candidateCount);
		for(const vector of vectors){
			const matches = await this._index.search(vector,{topK});
			for(const match of matches){
				const previous = scores.get(match.groupId);
				if(undefined === previous
				|| match.relevanceScore > previous){
					scores.set(match.groupId,match.relevanceScore);
				}
			}
		}
		const petsById = new Map<utf8_t,PetQuerySchemaServerDatabasePetEntryType>();
		for(const pet of pets){
			petsById.set(pet.gid,pet);
		}
		const ranked:Array<PetQueryServerDatabasePetSearchScore> = [];
		for(const [groupId, relevanceScore] of scores){
			ranked.push({groupId,relevanceScore});
		}
		ranked.sort(this._compareScores);
		const results:Array<PetQuerySchemaServerDatabasePetEntryType> = [];
		for(const match of ranked){
			const pet = petsById.get(match.groupId);
			if(undefined === pet){
				throw new Error('AI index returned an unknown pet');
			}
			results.push(pet);
		}
		return results;
	}

	protected _compareScores(
		left:PetQueryServerDatabasePetSearchScore,
		right:PetQueryServerDatabasePetSearchScore
	):float64_t{
		return right.relevanceScore - left.relevanceScore
			|| (left.groupId < right.groupId ? -1 :
				left.groupId > right.groupId ? 1 : 0);
	}

	protected async _releaseCandidates(
		candidates:readonly PetQueryServerDatabasePetSearchCandidate[]
	):Promise<void>{
		for(const candidate of candidates){
			candidate.vector?.destructor();
		}
		const images:Array<PetQueryAiSearchImage> = [];
		for(const candidate of candidates){
			images.push(candidate.image);
		}
		await this._releaseImages(images);
	}

	protected async _releaseImages(
		images:readonly PetQueryAiSearchImage[]
	):Promise<void>{
		const cleanups:Array<Promise<void>> = [];
		for(const image of images){
			cleanups.push(image.destructor());
		}
		await Promise.allSettled(cleanups);
	}
};
