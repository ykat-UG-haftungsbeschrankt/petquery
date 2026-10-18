import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import { PetQueryAiSearchHnswIndex } from "./pet-query-ai-search-hnsw-index.js";
import { PetQueryAiSearchRank } from "./pet-query-ai-search-rank.js";
import type { PetQueryAnnOptions, PetQueryImageRecord, PetQueryMatch } from "./types.js";

interface PetQuerySynchronizedIndex {
  readonly index: PetQueryAiSearchHnswIndex;
  readonly sourceId: string;
  revision: number;
}

/** SQLite owns persistence; this graph is a disposable, revision-tagged acceleration layer. */
export class PetQueryAiSearchAnn {
  private state: PetQuerySynchronizedIndex | undefined;
  private readonly options: Required<PetQueryAnnOptions>;
  private readonly rank = new PetQueryAiSearchRank();

  constructor(options: PetQueryAnnOptions = {}) {
    this.options = {
      efSearch: options.efSearch ?? 100,
      efConstruction: options.efConstruction ?? 200,
      m: options.m ?? 16,
      oversample: options.oversample ?? 4,
    };
  }

  knownRevision(model: string, sourceId = ""): number | undefined {
    const state = this.state;
    return state?.index.model === model && state.sourceId === sourceId ? state.revision : undefined;
  }

  rebuild(images: readonly PetQueryImageRecord[], revision: number, model: string, sourceId = ""): void {
    // Publish atomically only after the complete graph has been validated and built.
    const index = new PetQueryAiSearchHnswIndex(images, model, this.options);
    this.state = { index, revision, sourceId };
  }

  /**
   * Apply committed changes only when the graph matches the transaction's starting revision.
   * Returns false on a stale/uninitialized graph; search will rebuild from SQLite.
   */
  applyMutation(
    upserts: readonly PetQueryImageRecord[], removedIds: readonly string[],
    previousRevision: number, revision: number, sourceId: string,
  ): boolean {
    const state = this.state;
    if (!state || state.sourceId !== sourceId || state.revision !== previousRevision) {
      this.clear();
      return false;
    }
    if (upserts.some((image) => !state.index.accepts(image))) {
      this.clear();
      return false;
    }
    try {
      for (const imageId of removedIds) state.index.remove(imageId);
      for (const image of upserts) state.index.upsert(image);
      state.revision = revision;
      return true;
    } catch (error) {
      this.clear();
      throw new Error(
        "Database mutation committed, but incremental ANN update failed; graph invalidated and will rebuild on search",
        { cause: error },
      );
    }
  }

  search(query: PetQueryAiSearchVector, queryPath: string, model: string, topK: number): PetQueryMatch[] {
    const candidates = this.searchCandidates(query, queryPath, model, topK * this.options.oversample);
    return this.rank.rank(query, candidates, { excludePath: queryPath, topK });
  }

  searchCandidates(
    query: PetQueryAiSearchVector, queryPath: string, model: string, candidateCount: number,
  ): PetQueryImageRecord[] {
    if (query.model !== model) throw new Error("Encoder version mismatch between query and requested model");
    const state = this.state;
    if (!state || state.index.model !== model) {
      throw new Error("ANN index has not been synchronized with the encoder");
    }
    return state.index.search(query, queryPath, candidateCount);
  }

  clear(): void {
    this.state = undefined;
  }
}
