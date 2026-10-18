import hnswlib from "hnswlib-node";
import type { HierarchicalNSW } from "hnswlib-node";
import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import { PetQueryAiSearchRank } from "./pet-query-ai-search-rank.js";
import type { PetQueryImageRecord, PetQueryAnnOptions } from "./types.js";

const MIN_CAPACITY = 16;
const RANDOM_SEED = 100;

/** Internal HNSW storage; database revisions are managed by the ANN coordinator. */
export class PetQueryAiSearchHnswIndex {
  private graph: HierarchicalNSW | undefined;
  private readonly images = new Map<number, PetQueryImageRecord>();
  private readonly labels = new Map<string, number>();
  private readonly paths = new Map<string, number>();
  private freeLabels: number[] = [];
  private nextLabel = 0;
  private readonly rank = new PetQueryAiSearchRank();

  constructor(
    images: readonly PetQueryImageRecord[],
    readonly model: string,
    private readonly options: Required<PetQueryAnnOptions>,
  ) {
    const normalized = images.map((image) => this.normalizeImage(image));
    const dimensions = normalized[0]?.vector.length;
    if (dimensions === undefined) return;
    for (const image of normalized) {
      if (image.vector.length !== dimensions) {
        throw new Error(`Feature dimension mismatch for image ${image.imageId}; re-add it`);
      }
    }
    const graph = this.createGraph(dimensions, Math.max(MIN_CAPACITY, normalized.length));
    this.graph = graph;
    normalized.forEach((image, label) => {
      graph.addPoint(Array.from(image.vector), label);
      this.storeImage(label, image);
    });
    this.nextLabel = normalized.length;
  }

  accepts(image: PetQueryImageRecord): boolean {
    return image.model === this.model &&
      (this.graph === undefined || image.vector.length === this.graph.getNumDimensions());
  }

  remove(imageId: string): void {
    const label = this.labels.get(imageId);
    if (label === undefined) return;
    const image = this.imageForLabel(label);
    if (!this.graph) throw new Error("Missing ANN record for deletion");
    this.graph.markDelete(label);
    this.labels.delete(imageId);
    this.images.delete(label);
    this.freeLabels.push(label);
    this.adjustPath(image.path, -1);
    if (this.images.size === 0) {
      this.graph = undefined;
      this.nextLabel = 0;
      this.freeLabels = [];
    }
  }

  upsert(image: PetQueryImageRecord): void {
    const normalized = this.normalizeImage(image);
    const graph = this.graph ??= this.createGraph(normalized.vector.length, MIN_CAPACITY);
    if (normalized.vector.length !== graph.getNumDimensions()) {
      throw new Error("Feature dimension mismatch");
    }
    const label = this.labels.get(image.imageId) ?? this.allocateLabel(graph);
    graph.addPoint(Array.from(normalized.vector), label);
    this.storeImage(label, normalized);
  }

  search(query: PetQueryAiSearchVector, queryPath: string, candidateCount: number): PetQueryImageRecord[] {
    if (!this.graph) return [];
    if (query.length !== this.graph.getNumDimensions()) throw new Error("Feature dimension mismatch");
    const eligible = this.images.size - (this.paths.get(queryPath) ?? 0);
    if (eligible === 0) return [];
    const count = Math.min(eligible, candidateCount);
    if (count === eligible) {
      return this.copyCandidates([...this.images.values()], queryPath);
    }
    this.graph.setEf(Math.max(this.options.efSearch, count));
    const result = this.graph.searchKnn(Array.from(query), count,
      (label) => this.imageForLabel(label).path !== queryPath);
    const candidates = result.neighbors.map((label) => this.imageForLabel(label));
    // Heavy churn can leave disconnected HNSW neighborhoods; preserve result cardinality.
    if (candidates.length < count) {
      return this.exactCandidates(query, queryPath, count);
    }
    return this.copyCandidates(candidates, queryPath);
  }

  private createGraph(dimensions: number, capacity: number): HierarchicalNSW {
    const graph = new hnswlib.HierarchicalNSW("cosine", dimensions);
    graph.initIndex(capacity, this.options.m, this.options.efConstruction, RANDOM_SEED);
    return graph;
  }

  private normalizeImage(image: PetQueryImageRecord): PetQueryImageRecord {
    if (image.model !== this.model || image.vector.model !== image.model) {
      throw new Error(`Encoder version mismatch for image ${image.imageId}; re-add it with the current encoder`);
    }
    return { ...image, vector: image.vector.normalize() };
  }

  private allocateLabel(graph: HierarchicalNSW): number {
    const reusable = this.freeLabels.pop();
    if (reusable !== undefined) {
      graph.unmarkDelete(reusable);
      return reusable;
    }
    if (this.nextLabel >= graph.getMaxElements()) {
      graph.resizeIndex(graph.getMaxElements() * 2);
    }
    return this.nextLabel++;
  }

  private storeImage(label: number, image: PetQueryImageRecord): void {
    const previous = this.images.get(label);
    if (previous) this.adjustPath(previous.path, -1);
    this.images.set(label, image);
    this.labels.set(image.imageId, label);
    this.adjustPath(image.path, 1);
  }

  private adjustPath(path: string, delta: number): void {
    const count = (this.paths.get(path) ?? 0) + delta;
    if (count === 0) this.paths.delete(path);
    else this.paths.set(path, count);
  }

  private imageForLabel(label: number): PetQueryImageRecord {
    const image = this.images.get(label);
    if (!image) throw new Error("ANN returned an unknown image label");
    return image;
  }

  private copyCandidates(
    images: readonly PetQueryImageRecord[], queryPath: string,
  ): PetQueryImageRecord[] {
    return images
      .filter((image) => image.path !== queryPath)
      .map((image) => ({ ...image, vector: new PetQueryAiSearchVector(image.vector, image.model) }));
  }

  private exactCandidates(
    query: PetQueryAiSearchVector, queryPath: string, count: number,
  ): PetQueryImageRecord[] {
    const images = [...this.images.values()];
    const matches = this.rank.rank(query, images, { excludePath: queryPath, topK: count });
    const ids = new Set(matches.map((image) => image.imageId));
    return this.copyCandidates(images.filter((image) => ids.has(image.imageId)), queryPath);
  }
}
