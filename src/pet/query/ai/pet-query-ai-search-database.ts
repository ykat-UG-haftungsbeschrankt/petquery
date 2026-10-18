import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import type { PetQueryImageRecord, PetQueryIndexMutation } from "./types.js";

export class PetQueryAiSearchDatabase {
  private readonly database: Database.Database;
  readonly sourceId: string;

  constructor(path: string) {
    this.sourceId = path === ":memory:" ? randomUUID() : resolve(path);
    mkdirSync(dirname(path), { recursive: true });
    this.database = new Database(path);
    try {
      this.database.exec(
        "CREATE TABLE IF NOT EXISTS features (" +
          "path TEXT NOT NULL, model TEXT NOT NULL, digest TEXT NOT NULL, " +
          "vector BLOB NOT NULL, PRIMARY KEY (path, model))",
      );
      this.database.exec(
        "CREATE TABLE IF NOT EXISTS indexed_images (" +
        "image_id TEXT PRIMARY KEY, group_id TEXT NOT NULL, path TEXT NOT NULL, " +
        "model TEXT NOT NULL, vector BLOB NOT NULL);" +
        "CREATE INDEX IF NOT EXISTS indexed_images_group ON indexed_images(group_id)",
      );
      this.database.exec(
        "CREATE TABLE IF NOT EXISTS index_revision (id INTEGER PRIMARY KEY CHECK (id = 1), revision INTEGER NOT NULL);" +
        "INSERT OR IGNORE INTO index_revision VALUES (1, 0);" +
        ["INSERT", "UPDATE", "DELETE"].map((event) =>
          `CREATE TRIGGER IF NOT EXISTS indexed_images_revision_${event.toLowerCase()} ` +
          `AFTER ${event} ON indexed_images BEGIN ` +
          "UPDATE index_revision SET revision = revision + 1 WHERE id = 1; END;",
        ).join(""),
      );
    } catch (error) {
      this.database.close();
      throw error;
    }
  }

  get(path: string, model: string, digest: string): PetQueryAiSearchVector | undefined {
    const row = this.database
      .prepare<[string, string, string], { vector: Buffer }>(
        "SELECT vector FROM features WHERE path = ? AND model = ? AND digest = ?",
      )
      .get(path, model, digest);
    if (!row) return undefined;
    return PetQueryAiSearchVector.decodeVector(row.vector, model, path);
  }

  put(path: string, model: string, digest: string, vector: PetQueryAiSearchVector): void {
    if (vector.model !== model) throw new Error("Encoder version mismatch between record and vector");
    const buffer = vector.encodeVector();
    this.database
      .prepare("INSERT OR REPLACE INTO features (path, model, digest, vector) VALUES (?, ?, ?, ?)")
      .run(path, model, digest, buffer);
  }

  addImage(image: PetQueryImageRecord): void {
    this.addImageWithRevision(image);
  }

  private mutate<T>(operation: () => T): PetQueryIndexMutation<T> {
    return this.database.transaction(() => {
      const previousRevision = this.currentRevision();
      const value = operation();
      return { previousRevision, revision: this.currentRevision(), value };
    }).immediate();
  }

  addImageWithRevision(image: PetQueryImageRecord): PetQueryIndexMutation<void> {
    return this.mutate(() => this.upsertImage(image));
  }

  private upsertImage(image: PetQueryImageRecord): void {
    if (image.vector.model !== image.model) {
      throw new Error("Encoder version mismatch between record and vector");
    }
    const existing = this.database.prepare<[string, string, number], { image_id: string }>(
      "SELECT image_id FROM indexed_images WHERE image_id != ? AND model = ? AND length(vector) != ? LIMIT 1",
    );
    // Keep every vector for a given encoder dimensionally compatible before publishing an update.
    if (existing.get(image.imageId, image.model, image.vector.length * 4)) {
      throw new Error("Feature dimension mismatch with indexed images");
    }
    this.database.prepare(
      "INSERT INTO indexed_images (image_id, group_id, path, model, vector) VALUES (?, ?, ?, ?, ?) " +
      "ON CONFLICT(image_id) DO UPDATE SET group_id=excluded.group_id, path=excluded.path, " +
      "model=excluded.model, vector=excluded.vector",
    ).run(image.imageId, image.groupId, image.path, image.model, image.vector.encodeVector());
  }

  removeImage(imageId: string): boolean {
    return this.removeImageWithRevision(imageId).value.length > 0;
  }

  removeGroup(groupId: string): number {
    return this.removeGroupWithRevision(groupId).value.length;
  }

  removeImageWithRevision(imageId: string): PetQueryIndexMutation<string[]> {
    return this.mutate(() => this.database.prepare<[string], { imageId: string }>(
      "DELETE FROM indexed_images WHERE image_id = ? RETURNING image_id AS imageId",
    ).all(imageId).map((row) => row.imageId));
  }

  removeGroupWithRevision(groupId: string): PetQueryIndexMutation<string[]> {
    return this.mutate(() => this.database.prepare<[string], { imageId: string }>(
      "DELETE FROM indexed_images WHERE group_id = ? RETURNING image_id AS imageId",
    ).all(groupId).map((row) => row.imageId));
  }

  images(): PetQueryImageRecord[] {
    return this.database.prepare<[], {
      groupId: string; imageId: string; path: string; model: string; vector: Buffer;
    }>(
      "SELECT group_id AS groupId, image_id AS imageId, path, model, vector " +
      "FROM indexed_images ORDER BY image_id",
    ).all().map((row) => ({
      ...row, vector: PetQueryAiSearchVector.decodeVector(row.vector, row.model, row.path),
    }));
  }

  /** Revision and rows must describe the same committed database snapshot. */
  snapshot(knownRevision?: number): { revision: number; images?: PetQueryImageRecord[] } {
    return this.database.transaction(() => {
      const revision = this.currentRevision();
      if (revision === knownRevision) return { revision };
      return { revision, images: this.images() };
    })();
  }

  private currentRevision(): number {
    const row = this.database.prepare<[], { revision: number }>(
      "SELECT revision FROM index_revision WHERE id = 1",
    ).get();
    if (!row || !Number.isSafeInteger(row.revision)) throw new Error("Invalid index revision");
    return row.revision;
  }

  close(): void {
    this.database.close();
  }
}
