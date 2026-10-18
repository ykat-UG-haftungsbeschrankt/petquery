import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import type { PetQueryImageRecord, PetQueryMatch, PetQueryRankOptions } from "./types.js";

/** Stateless exact reranking of retrieved candidates, not another approximate search. */
export class PetQueryAiSearchRank {
  private readonly topK: number;

  constructor(config: PetQueryRankOptions = {}) {
    this.topK = config.topK ?? 10;
  }

  rank(
    query: PetQueryAiSearchVector,
    candidates: readonly PetQueryImageRecord[],
    options: PetQueryRankOptions = {},
  ): PetQueryMatch[] {
    const topK = options.topK ?? this.topK;
    const feature = query.normalize();
    const matches: PetQueryMatch[] = [];
    for (const candidate of candidates) {
      if (candidate.model !== query.model || candidate.vector.model !== candidate.model) {
        throw new Error(`Encoder version mismatch for image ${candidate.imageId}; re-add it with the current encoder`);
      }
      if (candidate.path === (options.excludePath ?? "")) continue;
      const vector = candidate.vector.normalize();
      if (vector.length !== feature.length) {
        throw new Error(`Feature dimension mismatch for image ${candidate.imageId}; re-add it`);
      }
      matches.push({
        groupId: candidate.groupId, imageId: candidate.imageId, path: candidate.path,
        relevanceScore: vector.relevanceScore(feature),
      });
    }
    matches.sort((left, right) => right.relevanceScore - left.relevanceScore ||
      (left.imageId < right.imageId ? -1 : left.imageId > right.imageId ? 1 : 0));
    return matches.slice(0, topK);
  }
}
