import { PetQueryAiSearchDatabase } from "./pet-query-ai-search-database.js";
import { PetQueryAiSearchAnn } from "./pet-query-ai-search-ann.js";
import { PetQueryAiSearchRank } from "./pet-query-ai-search-rank.js";
import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import type {
  PetQueryCandidateSearchOptions, PetQueryImageRecord, PetQueryIndexedImage,
  PetQueryMatch, PetQuerySearchOptions,
} from "./types.js";

/** Coordinates durable records and a disposable ANN graph; no image I/O or encoding. */
export class PetQueryAiSearchIndex {
  private readonly rank = new PetQueryAiSearchRank();

  constructor(
    private readonly database: PetQueryAiSearchDatabase,
    private readonly ann?: PetQueryAiSearchAnn,
  ) {}

  add(image: PetQueryIndexedImage): void {
    const path = image.path ?? `pet-query:image:${encodeURIComponent(image.imageId)}`;
    const normalized: PetQueryImageRecord = {
      groupId: image.groupId,
      imageId: image.imageId,
      path,
      model: image.vector.model,
      vector: image.vector.normalize(),
    };
    const change = this.database.addImageWithRevision(normalized);
    this.ann?.applyMutation(
      [normalized], [], change.previousRevision, change.revision, this.database.sourceId,
    );
  }

  removeImage(imageId: string): boolean {
    const change = this.database.removeImageWithRevision(imageId);
    this.ann?.applyMutation([], change.value, change.previousRevision, change.revision, this.database.sourceId);
    return change.value.length > 0;
  }

  removeGroup(groupId: string): number {
    const change = this.database.removeGroupWithRevision(groupId);
    this.ann?.applyMutation([], change.value, change.previousRevision, change.revision, this.database.sourceId);
    return change.value.length;
  }

  search(query: PetQueryAiSearchVector, options: PetQuerySearchOptions = {}): PetQueryMatch[] {
    const topK = options.topK ?? 10;
    const feature = query.normalize();
    const queryPath = options.excludePath ?? "";
    if (!this.ann) return this.rank.rank(feature, this.database.images(), options);
    this.synchronize(query.model);
    return this.ann.search(feature, queryPath, query.model, topK);
  }

  searchCandidates(
    query: PetQueryAiSearchVector, options: PetQueryCandidateSearchOptions = {},
  ): PetQueryImageRecord[] {
    const count = options.candidateCount ?? 100;
    const feature = query.normalize();
    const path = options.excludePath ?? "";
    if (this.ann) {
      this.synchronize(query.model);
      return this.ann.searchCandidates(feature, path, query.model, count);
    }
    const images = this.database.images();
    const ranked = this.rank.rank(feature, images, { topK: count, excludePath: path });
    const byId = new Map(images.map((image) => [image.imageId, image]));
    return ranked.map((match) => {
      const image = byId.get(match.imageId);
      if (!image) throw new Error("Missing candidate in database snapshot");
      return image;
    });
  }

  private synchronize(model: string): void {
    if (!this.ann) return;
    const sourceId = this.database.sourceId;
    const snapshot = this.database.snapshot(this.ann.knownRevision(model, sourceId));
    if (snapshot.images !== undefined) {
      this.ann.rebuild(snapshot.images, snapshot.revision, model, sourceId);
    }
  }
}
