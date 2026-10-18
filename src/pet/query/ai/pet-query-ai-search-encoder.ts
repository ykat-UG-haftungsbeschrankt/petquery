import sharp from "sharp";
import { PetQueryAiSearchImage } from "./pet-query-ai-search-image.js";
import { PetQueryAiSearchVector } from "./pet-query-ai-search-vector.js";
import type { PetQueryEncoderOptions, PetQueryLogger } from "./types.js";

/** DINOv2 inference, including the preprocessing and pooling defining its embedding space. */
export class PetQueryAiSearchEncoder {
  static readonly modelId = "Xenova/dinov2-small";
  static readonly imageSize = 224;
  private static readonly means = [0.485, 0.456, 0.406] as const;
  private static readonly deviations = [0.229, 0.224, 0.225] as const;

  readonly cacheKey: string;
  private model: Promise<import("@huggingface/transformers").PreTrainedModel> | undefined;
  private readonly options: PetQueryEncoderOptions;
  private readonly logger: PetQueryLogger;
  private readonly threads: number;

  constructor(options: PetQueryEncoderOptions = {}) {
    this.options = { ...options };
    this.logger = options.logger ?? console;
    this.threads = options.threads ?? 4;
    if (options.flipAverage !== undefined && typeof options.flipAverage !== "boolean") {
      throw new TypeError("flipAverage must be a boolean");
    }
    const version = options.flipAverage ? "flip-average-v2" : "letterbox-v1";
    // ONNX/libvips preprocessing is separately versioned from the Python implementation.
    this.cacheKey = `${PetQueryAiSearchEncoder.modelId}:fp32:cls-sharp-${sharp.versions.sharp}-${version}`;
  }

  async encode(image: PetQueryAiSearchImage): Promise<PetQueryAiSearchVector> {
    const [vector] = await this.encodeBatch([image]);
    if (!vector) throw new Error("Encoder returned no image feature");
    return vector;
  }

  async encodeBatch(images: readonly PetQueryAiSearchImage[]): Promise<PetQueryAiSearchVector[]> {
    if (images.length === 0) return [];
    const prepared: Buffer[] = [];
    for (const image of images) prepared.push(await PetQueryAiSearchEncoder.prepareImage(image));
    const { AutoModel, Tensor } = await import("@huggingface/transformers");
    if (!this.model) {
      const modelId = PetQueryAiSearchEncoder.modelId;
      this.logger.info(`Loading ${modelId} on CPU (first use downloads ONNX weights)`);
      this.model = AutoModel.from_pretrained(modelId, {
        dtype: "fp32",
        device: "cpu",
        local_files_only: this.options.localFilesOnly ?? false,
        ...(this.options.modelCacheDir === undefined ? {} : { cache_dir: this.options.modelCacheDir }),
        session_options: { intraOpNumThreads: this.threads },
      });
    }
    const model = await this.model;
    const flipAverage = this.options.flipAverage ?? false;
    const data = PetQueryAiSearchEncoder.imageTensorData(prepared, flipAverage);
    const views = flipAverage ? 2 : 1;
    const size = PetQueryAiSearchEncoder.imageSize;
    const pixels = new Tensor("float32", data, [images.length * views, 3, size, size]);
    const output = await model({ pixel_values: pixels });
    const hidden: unknown = output.last_hidden_state;
    if (!(hidden instanceof Tensor) || !(hidden.data instanceof Float32Array)) {
      throw new Error("DINOv2 did not return float32 last_hidden_state");
    }
    return PetQueryAiSearchEncoder.clsEmbeddings(
      hidden.data, hidden.dims, images.length, flipAverage, this.cacheKey,
    );
  }

  static async prepareImage(image: PetQueryAiSearchImage): Promise<Buffer> {
    try {
      const size = PetQueryAiSearchEncoder.imageSize;
      return await sharp(image.toBuffer(), { animated: false, limitInputPixels: 89_478_485 })
        .rotate()
        .removeAlpha()
        .toColourspace("srgb")
        .resize(size, size, { fit: "contain", background: { r: 127, g: 127, b: 127 } })
        .raw()
        .toBuffer();
    } catch (error) {
      throw new Error(`Cannot read image ${image.path ?? "<buffer>"}`, { cause: error });
    }
  }

  /** Layout: [image0 original, image0 flipped, image1 original, ...], in CHW order. */
  static imageTensorData(images: readonly Uint8Array[], flipAverage: boolean): Float32Array {
    const size = PetQueryAiSearchEncoder.imageSize;
    const pixels = size * size;
    const views = flipAverage ? 2 : 1;
    const input = new Float32Array(images.length * views * 3 * pixels);
    for (const [batch, image] of images.entries()) {
      if (image.length !== pixels * 3) throw new Error("Expected a 224x224 RGB image after preprocessing");
      for (let view = 0; view < views; view++) {
        for (const [channel, mean] of PetQueryAiSearchEncoder.means.entries()) {
          const deviation = PetQueryAiSearchEncoder.deviations[channel];
          if (deviation === undefined) throw new Error("Invalid normalization channel");
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              const sourceX = view === 0 ? x : size - x - 1;
              const value = image[(y * size + sourceX) * 3 + channel];
              if (value === undefined) throw new Error("Missing RGB pixel");
              input[((batch * views + view) * 3 + channel) * pixels + y * size + x] =
                (value / 255 - mean) / deviation;
            }
          }
        }
      }
    }
    return input;
  }

  static clsEmbeddings(
    data: Float32Array, shape: readonly number[], imageCount: number, flipAverage: boolean, model: string,
  ): PetQueryAiSearchVector[] {
    const views = flipAverage ? 2 : 1;
    const [batch, tokens, dimensions] = shape;
    if (
      shape.length !== 3 || batch !== imageCount * views ||
      tokens === undefined || !Number.isSafeInteger(tokens) || tokens < 1 ||
      dimensions === undefined || !Number.isSafeInteger(dimensions) || dimensions < 1 ||
      data.length !== batch * tokens * dimensions
    ) {
      throw new Error("Unexpected DINOv2 feature shape");
    }
    const result: PetQueryAiSearchVector[] = [];
    for (let image = 0; image < imageCount; image++) {
      const start = image * views * tokens * dimensions;
      const original = new PetQueryAiSearchVector(data.slice(start, start + dimensions), model).normalize();
      if (!flipAverage) {
        result.push(original);
        continue;
      }
      const flippedStart = start + tokens * dimensions;
      const flipped = new PetQueryAiSearchVector(
        data.slice(flippedStart, flippedStart + dimensions), model,
      ).normalize();
      // Normalize each view before averaging so neither can dominate by magnitude.
      const combined = new PetQueryAiSearchVector(dimensions, model);
      original.forEach((value, index) => {
        const other = flipped[index];
        if (other === undefined) throw new Error("Missing flipped feature component");
        combined[index] = value + other;
      });
      result.push(combined.normalize());
    }
    return result;
  }

  /** Release the native ONNX session. A later encode call loads it again. */
  async dispose(): Promise<void> {
    if (!this.model) return;
    const model = await this.model;
    await model.dispose();
    this.model = undefined;
  }
}
