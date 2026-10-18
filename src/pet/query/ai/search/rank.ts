/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

import type { PetQueryAiSearchImageRecord } from '#petquery/ai/search/database.js';
import type { PetQueryAiSearchOptions } from '#petquery/ai/search/index.js';
import type { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';

export interface PetQueryAiSearchMatch{
	groupId:utf8_t;
	imageId:utf8_t;
	path:utf8_t;
	// Clipped cosine similarity times 100, not an identity probability.
	relevanceScore:float64_t;
};

export interface PetQueryAiSearchRankOptions extends PetQueryAiSearchOptions{
};

// Stateless exact reranking, not another approximate search.
export class PetQueryAiSearchRank extends PetQueryDestructor{
	protected readonly _topK:size_t;

	constructor(config:PetQueryAiSearchRankOptions = {}){
		super();
		this._topK = config.topK ?? 10;
	}

	public override async _destructor():Promise<void>{
	}

	rank(
		query:PetQueryAiSearchVector,
		candidates:readonly PetQueryAiSearchImageRecord[],
		options:PetQueryAiSearchRankOptions = {},
	):PetQueryAiSearchMatch[]{
		this._assertNotDestroyed();
		const topK = options.topK ?? this._topK;
		const feature = query.normalize();
		try{
			const matches:PetQueryAiSearchMatch[] = [];
			for(const candidate of candidates){
				if(candidate.model !== query.getModel() ||
					candidate.model !== candidate.vector.getModel()){
					throw new Error(
						`Encoder version mismatch for image ${candidate.imageId}; ` +
						're-add it with the current encoder',
					);
				}
				if(candidate.path === (options.excludePath ?? '')){
					continue;
				}
				const vector = candidate.vector.normalize();
				try{
					if(vector.getLength() !== feature.getLength()){
						throw new Error(
							'Feature dimension mismatch for image ' +
							`${candidate.imageId}; re-add it`,
						);
					}
					matches.push({
						groupId: candidate.groupId,
						imageId: candidate.imageId,
						path: candidate.path,
						relevanceScore: vector.relevanceScore(feature),
					});
				}
				finally{
					vector.destructor();
				}
			}
			matches.sort(this._compareMatches);
			return matches.slice(0, topK);
		}
		finally{
			feature.destructor();
		}
	}

	protected _compareMatches(
		left:PetQueryAiSearchMatch, right:PetQueryAiSearchMatch,
	):float64_t{
		return right.relevanceScore - left.relevanceScore ||
			(left.imageId < right.imageId ? -1 :
				left.imageId > right.imageId ? 1 : 0);
	}
};
