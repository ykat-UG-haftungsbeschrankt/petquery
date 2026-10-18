import type { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";

export interface PetQueryMatch {
  groupId: string;
  imageId: string;
  path: string;
  /** Clipped cosine similarity times 100, not a probability of pet identity. */
  relevanceScore: number;
}

export interface PetQueryLogger {
  info(message: string): void;
  warn(message: string): void;
}

export interface PetQuerySearchOptions {
  topK?: number;
  excludePath?: string;
}

export interface PetQueryAnnOptions {
  /** Search breadth; higher improves recall at increased cost (default 100). */
  efSearch?: number;
  /** Graph build breadth (default 200). */
  efConstruction?: number;
  /** Connections per node, between 2 and 100 (default 16). */
  m?: number;
  /** Exact-score this many candidates per requested result (default 4). */
  oversample?: number;
}

export interface PetQueryEncoderOptions {
  modelCacheDir?: string;
  localFilesOnly?: boolean;
  threads?: number;
  logger?: PetQueryLogger;
  /** Average original and mirrored embeddings; about twice the inference work. */
  flipAverage?: boolean;
}

export interface PetQueryIndexedImage {
  groupId: string;
  imageId: string;
  vector: PetQueryAiSearchVector;
  path?: string;
}

export interface PetQueryImageRecord {
  groupId: string;
  imageId: string;
  path: string;
  model: string;
  vector: PetQueryAiSearchVector;
}

export interface PetQueryIndexMutation<T> {
  previousRevision: number;
  revision: number;
  value: T;
}

export interface PetQueryCandidateSearchOptions {
  candidateCount?: number;
  excludePath?: string;
}

export interface PetQueryRankOptions extends PetQuerySearchOptions {}
