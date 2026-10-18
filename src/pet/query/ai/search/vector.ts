/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

// Model-tagged embedding with non-mutating math and little-endian storage.
export class PetQueryAiSearchVector extends Float32Array{
	protected readonly _model:utf8_t;

	static{
		// Native typed-array operations cannot supply a model to our constructor.
		Object.defineProperty(this, Symbol.species, { value: Float32Array });
	}

	constructor(values:ArrayLike<float32_t>|size_t, model:utf8_t){
		super('number' === typeof values ? values : values.length);
		this._model = model;
		if('number' !== typeof values){
			this.set(values);
		}
	}

	// Float32Array inheritance is required by callers and cannot share a base.
	// Both cleanup entry points are no-ops for this GC-owned value.
	// The synchronous adapter preserves SQLite's synchronous operations.
	destructor():void{
	}

	public async _destructor():Promise<void>{
	}

	getModel():utf8_t{
		return this._model;
	}

	getLength():size_t{
		return this.length;
	}

	static decodeVector(
		buffer:Buffer, model:utf8_t, source:utf8_t = model,
	):PetQueryAiSearchVector{
		if(!Buffer.isBuffer(buffer) || 0 === buffer.length ||
			0 !== buffer.length % 4){
			throw new Error(
				`Invalid cached feature for ${source}; ` +
				're-add the image or rebuild the cache',
			);
		}
		const vector = new PetQueryAiSearchVector(buffer.length / 4, model);
		for(let index = 0; index < vector.getLength(); index++){
			vector[index] = buffer.readFloatLE(index * 4);
		}
		return vector;
	}

	encodeVector():Buffer{
		const buffer = Buffer.alloc(this.length * 4);
		for(let index = 0; index < this.length; index++){
			buffer.writeFloatLE(this[index]!, index * 4);
		}
		return buffer;
	}

	normalize():PetQueryAiSearchVector{
		let squaredNorm:float64_t = 0;
		for(const value of this){
			if(!Number.isFinite(value)){
				throw new Error('Encoder must return finite feature vectors');
			}
			squaredNorm += value * value;
		}
		if(!(squaredNorm > 0) || !Number.isFinite(squaredNorm)){
			throw new Error(
				'Encoder returned an empty or zero-length feature vector',
			);
		}
		const norm = Math.sqrt(squaredNorm);
		const result = new PetQueryAiSearchVector(this.length, this._model);
		for(let index = 0; index < this.length; index++){
			result[index] = this[index]! / norm;
		}
		return result;
	}

	// Both vectors must already be unit-normalized.
	relevanceScore(other:Float32Array):float64_t{
		if(other instanceof PetQueryAiSearchVector &&
			this._model !== other.getModel()){
			throw new Error('Encoder version mismatch between feature vectors');
		}
		if(this.length !== other.length){
			throw new Error('Feature dimension mismatch');
		}
		let similarity:float64_t = 0;
		for(let index = 0; index < this.length; index++){
			const left = this[index];
			const right = other[index];
			if(undefined === left || undefined === right ||
				!Number.isFinite(left) || !Number.isFinite(right)){
				throw new Error('Invalid feature component');
			}
			similarity += left * right;
		}
		return Math.min(1, Math.max(0, similarity)) * 100;
	}
};
