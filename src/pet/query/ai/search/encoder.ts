/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { AutoModel } from '@huggingface/transformers';
import { PetQueryAiSearchVector } from '#petquery/ai/search/vector.js';
import { PetQueryDestructor } from '#petquery/destructor.js';
import { Tensor } from '@huggingface/transformers';
import sharp from 'sharp';

import type { PetQueryAiSearchImage } from '#petquery/ai/search/image.js';
import type { PreTrainedModel } from '@huggingface/transformers';
import type { Sharp } from 'sharp';

export interface PetQueryAiSearchLogger{
	info(message:utf8_t):void;
	warn(message:utf8_t):void;
};

export interface PetQueryAiSearchEncoderOptions{
	modelCacheDir?:utf8_t;
	localFilesOnly?:bool_t;
	threads?:size_t;
	logger?:PetQueryAiSearchLogger;
	// Average original/mirrored embeddings; about twice the inference work.
	flipAverage?:bool_t;
};

// Preprocessing and pooling define the DINOv2 embedding space.
export class PetQueryAiSearchEncoder extends PetQueryDestructor{
	static readonly modelId:utf8_t = 'Xenova/dinov2-small';
	static readonly imageSize:size_t = 224;
	protected static readonly _means:readonly float64_t[] =
		[0.485, 0.456, 0.406];
	protected static readonly _deviations:readonly float64_t[] =
		[0.229, 0.224, 0.225];

	readonly cacheKey:utf8_t;
	protected _model:Promise<PreTrainedModel>|undefined;
	protected readonly _options:PetQueryAiSearchEncoderOptions;
	protected readonly _logger:PetQueryAiSearchLogger;
	protected readonly _threads:size_t;
	protected readonly _pending:Set<Promise<PetQueryAiSearchVector[]>>;
	protected _disposal:Promise<void>|undefined;
	protected _closing:bool_t;

	constructor(options:PetQueryAiSearchEncoderOptions = {}){
		super();
		this._model = undefined;
		this._options = { ...options };
		this._logger = options.logger ?? console;
		this._threads = options.threads ?? 4;
		this._pending = new Set();
		this._disposal = undefined;
		this._closing = false;
		const version = options.flipAverage ? 'flip-average-v2' : 'letterbox-v1';
		// Preprocessing is versioned separately from the Python implementation.
		this.cacheKey = `${PetQueryAiSearchEncoder.modelId}:fp32:` +
			`cls-sharp-${sharp.versions.sharp}-${version}`;
	}

	public override async _destructor():Promise<void>{
		try{
			this._closing = true;
			await this.dispose();
		}
		catch(UNUSED_e){
		}
	}

	protected async _disposeModel():Promise<void>{
		try{
			// Do not release the native session while an inference is using it.
			await Promise.allSettled([...this._pending]);
			const loading = this._model;
			this._model = undefined;
			if(loading){
				const model = await loading;
				await model.dispose();
			}
		}
		catch(UNUSED_e){
		}
	}

	async encode(image:PetQueryAiSearchImage):Promise<PetQueryAiSearchVector>{
		const [vector] = await this.encodeBatch([image]);
		if(!vector){
			throw new Error('Encoder returned no image feature');
		}
		return vector;
	}

	async encodeBatch(
		images:readonly PetQueryAiSearchImage[],
	):Promise<PetQueryAiSearchVector[]>{
		this._assertOpen();
		while(this._disposal){
			await this._disposal;
			this._assertOpen();
		}
		this._assertOpen();
		const operation = this._encodeBatch(images);
		this._pending.add(operation);
		try{
			return await operation;
		}
		finally{
			this._pending.delete(operation);
		}
	}

	protected _assertOpen():void{
		this._assertNotDestroyed();
		if(this._closing){
			throw new Error('PetQueryAiSearchEncoder is destructed');
		}
	}

	protected async _encodeBatch(
		images:readonly PetQueryAiSearchImage[],
	):Promise<PetQueryAiSearchVector[]>{
		if(0 === images.length){
			return [];
		}
		const prepared:Buffer[] = [];
		for(const image of images){
			prepared.push(await PetQueryAiSearchEncoder.prepareImage(image));
		}
		if(!this._model){
			const modelId = PetQueryAiSearchEncoder.modelId;
			this._logger.info(
				`Loading ${modelId} on CPU (first use downloads ONNX weights)`,
			);
			this._model = AutoModel.from_pretrained(modelId, {
				dtype: 'fp32',
				device: 'cpu',
				local_files_only: this._options.localFilesOnly ?? false,
				...(undefined === this._options.modelCacheDir ? {} :
					{ cache_dir: this._options.modelCacheDir }),
				session_options: { intraOpNumThreads: this._threads },
			});
		}
		const model = await this._model;
		const flipAverage = this._options.flipAverage ?? false;
		const data = PetQueryAiSearchEncoder.imageTensorData(
			prepared, flipAverage,
		);
		const views = flipAverage ? 2 : 1;
		const size = PetQueryAiSearchEncoder.imageSize;
		const pixels = new Tensor(
			'float32', data, [images.length * views, 3, size, size],
		);
		let output:unknown;
		try{
			output = await model({ pixel_values: pixels });
			if('object' !== typeof output || null === output ||
				!('last_hidden_state' in output)){
				throw new Error('DINOv2 did not return last_hidden_state');
			}
			const hidden:unknown = output.last_hidden_state;
			if(!(hidden instanceof Tensor) ||
				!(hidden.data instanceof Float32Array)){
				throw new Error('DINOv2 did not return float32 last_hidden_state');
			}
			return PetQueryAiSearchEncoder.clsEmbeddings(
				hidden.data, hidden.dims, images.length, flipAverage, this.cacheKey,
			);
		}
		finally{
			const tensors = new Set([pixels]);
			if('object' === typeof output && null !== output){
				for(const value of Object.values(output)){
					if(value instanceof Tensor){
						tensors.add(value);
					}
				}
			}
			for(const tensor of tensors){
				tensor.dispose();
			}
		}
	}

	static async prepareImage(image:PetQueryAiSearchImage):Promise<Buffer>{
		const size = PetQueryAiSearchEncoder.imageSize;
		let pipeline:Sharp|undefined;
		try{
			pipeline = sharp(image.toBuffer(), {
				animated: false, limitInputPixels: 89_478_485,
			});
			pipeline.rotate();
			pipeline.removeAlpha();
			pipeline.toColourspace('srgb');
			pipeline.resize(size, size, {
				fit: 'contain', background: { r: 127, g: 127, b: 127 },
			});
			pipeline.raw();
			return await pipeline.toBuffer();
		}
		catch(error){
			throw new Error('Cannot read image buffer', {
				cause: error,
			});
		}
		finally{
			pipeline?.destroy();
		}
	}

	// Layout: [image0 original, image0 flipped, image1 original, ...], CHW.
	static imageTensorData(
		images:readonly Uint8Array[], flipAverage:bool_t,
	):Float32Array{
		const size = PetQueryAiSearchEncoder.imageSize;
		const pixels = size * size;
		const views = flipAverage ? 2 : 1;
		const input = new Float32Array(images.length * views * 3 * pixels);
		for(const [batch, image] of images.entries()){
			if(pixels * 3 !== image.length){
				throw new Error(
					'Expected a 224x224 RGB image after preprocessing',
				);
			}
			for(let view = 0; view < views; view++){
				for(const [channel, mean] of
					PetQueryAiSearchEncoder._means.entries()){
					const deviation = PetQueryAiSearchEncoder._deviations[channel]!;
					for(let y = 0; y < size; y++){
						for(let x = 0; x < size; x++){
							const sourceX = 0 === view ? x : size - x - 1;
							const value = image[(y * size + sourceX) * 3 + channel]!;
							const offset = ((batch * views + view) * 3 + channel) *
								pixels + y * size + x;
							input[offset] = (value / 255 - mean) / deviation;
						}
					}
				}
			}
		}
		return input;
	}

	static clsEmbeddings(
		data:Float32Array, shape:readonly size_t[], imageCount:size_t,
		flipAverage:bool_t, model:utf8_t,
	):PetQueryAiSearchVector[]{
		const views = flipAverage ? 2 : 1;
		const [batch, tokens, dimensions] = shape;
		if(3 !== shape.length || imageCount * views !== batch ||
			undefined === tokens || !Number.isSafeInteger(tokens) || tokens < 1 ||
			undefined === dimensions || !Number.isSafeInteger(dimensions) ||
			dimensions < 1 || batch * tokens * dimensions !== data.length){
			throw new Error('Unexpected DINOv2 feature shape');
		}
		const result:PetQueryAiSearchVector[] = [];
		try{
			for(let image = 0; image < imageCount; image++){
				const start = image * views * tokens * dimensions;
				const original = PetQueryAiSearchEncoder._normalizedSlice(
					data, start, dimensions, model,
				);
				if(!flipAverage){
					result.push(original);
					continue;
				}
				try{
					result.push(PetQueryAiSearchEncoder._averageViews(
						data, start + tokens * dimensions, dimensions, model,
						original,
					));
				}
				finally{
					original.destructor();
				}
			}
			return result;
		}
		catch(error){
			for(const vector of result){
				vector.destructor();
			}
			throw error;
		}
	}

	protected static _normalizedSlice(
		data:Float32Array, start:size_t, dimensions:size_t, model:utf8_t,
	):PetQueryAiSearchVector{
		const vector = new PetQueryAiSearchVector(
			data.slice(start, start + dimensions), model,
		);
		try{
			return vector.normalize();
		}
		finally{
			vector.destructor();
		}
	}

	protected static _averageViews(
		data:Float32Array, start:size_t, dimensions:size_t, model:utf8_t,
		original:PetQueryAiSearchVector,
	):PetQueryAiSearchVector{
		const flipped = PetQueryAiSearchEncoder._normalizedSlice(
			data, start, dimensions, model,
		);
		try{
			const combined = new PetQueryAiSearchVector(dimensions, model);
			try{
				// Unit-normalize each view so neither dominates by magnitude.
				for(let index = 0; index < dimensions; index++){
					combined[index] = original[index]! + flipped[index]!;
				}
				return combined.normalize();
			}
			finally{
				combined.destructor();
			}
		}
		finally{
			flipped.destructor();
		}
	}

	// Reusable session release; destructor() permanently closes the encoder.
	async dispose():Promise<void>{
		const disposal = this._disposal ??= this._disposeModel();
		try{
			await disposal;
		}
		finally{
			if(disposal === this._disposal){
				this._disposal = undefined;
			}
		}
	}
};
