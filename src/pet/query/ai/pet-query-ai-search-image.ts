import { readFile, realpath } from "node:fs/promises";

/** Encoded image content; model-specific decoding and resizing belong to the encoder. */
export class PetQueryAiSearchImage {
  private constructor(private readonly content: Buffer, readonly path?: string) {}

  static async fromPath(path: string): Promise<PetQueryAiSearchImage> {
    const canonical = await realpath(path);
    const bytes = await readFile(canonical);
    PetQueryAiSearchImage.validateContent(bytes);
    return new PetQueryAiSearchImage(bytes, canonical);
  }

  static fromBuffer(buffer: Uint8Array): PetQueryAiSearchImage {
    PetQueryAiSearchImage.validateContent(buffer);
    return new PetQueryAiSearchImage(Buffer.from(buffer));
  }

  static fromBase64(base64: string): PetQueryAiSearchImage {
    const value = base64.startsWith("data:")
      ? /^data:image\/[a-zA-Z0-9.+-]+;base64,(.*)$/.exec(base64)?.[1]
      : base64;
    if (value === undefined || value.length === 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$/.test(value)) {
      throw new TypeError("Expected a non-empty base64 image or image data URI");
    }
    const buffer = Buffer.from(value, "base64");
    if (buffer.toString("base64").replace(/=+$/, "") !== value.replace(/=+$/, "")) {
      throw new TypeError("Invalid base64 image encoding");
    }
    return PetQueryAiSearchImage.fromBuffer(buffer);
  }

  private static validateContent(bytes: Uint8Array): void {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) {
      throw new TypeError("Image content must be a non-empty Uint8Array");
    }
  }

  /** Return a copy so callers cannot mutate a previously constructed image. */
  toBuffer(): Buffer {
    return Buffer.from(this.content);
  }
}
