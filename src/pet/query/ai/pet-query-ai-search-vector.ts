/** A model-tagged embedding with non-mutating math and little-endian serialization. */
export class PetQueryAiSearchVector extends Float32Array {
  constructor(values: ArrayLike<number> | number, readonly model: string) {
    super(typeof values === "number" ? values : values.length);
    if (typeof values !== "number") this.set(values);
  }

  // Typed-array slice/map cannot supply the model required by this constructor.
  static get [Symbol.species](): Float32ArrayConstructor {
    return Float32Array;
  }

  static decodeVector(buffer: Buffer, model: string, source = model): PetQueryAiSearchVector {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length % 4 !== 0) {
      throw new Error(`Invalid cached feature for ${source}; re-add the image or rebuild the cache`);
    }
    const vector = new PetQueryAiSearchVector(buffer.length / 4, model);
    for (let index = 0; index < vector.length; index++) {
      vector[index] = buffer.readFloatLE(index * 4);
    }
    return vector;
  }

  encodeVector(): Buffer {
    const buffer = Buffer.alloc(this.length * 4);
    this.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
    return buffer;
  }

  normalize(): PetQueryAiSearchVector {
    let squaredNorm = 0;
    for (const value of this) {
      if (!Number.isFinite(value)) throw new Error("Encoder must return finite feature vectors");
      squaredNorm += value * value;
    }
    if (squaredNorm === 0 || !Number.isFinite(squaredNorm)) {
      throw new Error("Encoder returned an empty or zero-length feature vector");
    }
    const norm = Math.sqrt(squaredNorm);
    const result = new PetQueryAiSearchVector(this.length, this.model);
    this.forEach((value, index) => { result[index] = value / norm; });
    return result;
  }

  /** Both vectors must already be unit-normalized. */
  relevanceScore(other: Float32Array): number {
    if (other instanceof PetQueryAiSearchVector && other.model !== this.model) {
      throw new Error("Encoder version mismatch between feature vectors");
    }
    if (this.length !== other.length) throw new Error("Feature dimension mismatch");
    let similarity = 0;
    for (let index = 0; index < this.length; index++) {
      const left = this[index];
      const right = other[index];
      if (left === undefined || right === undefined || !Number.isFinite(left) || !Number.isFinite(right)) {
        throw new Error("Invalid feature component");
      }
      similarity += left * right;
    }
    return Math.min(1, Math.max(0, similarity)) * 100;
  }
}
