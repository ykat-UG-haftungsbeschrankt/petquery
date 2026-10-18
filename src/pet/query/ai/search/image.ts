/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';
import { readFile } from 'node:fs/promises';
import { realpath } from 'node:fs/promises';

// Encoded content; model-specific preprocessing belongs to the encoder.
export class PetQueryAiSearchImage extends PetQueryDestructor{
	protected _content:Buffer;
	readonly path:utf8_t|undefined;

	protected constructor(content:Buffer, path?:utf8_t){
		super();
		this._content = content;
		this.path = path;
	}

	public override async _destructor():Promise<void>{
		try{
			this._content = Buffer.alloc(0);
		}
		catch(UNUSED_e){
		}
	}

	static async fromPath(path:utf8_t):Promise<PetQueryAiSearchImage>{
		const canonical = await realpath(path);
		const bytes = await readFile(canonical);
		PetQueryAiSearchImage._validateContent(bytes);
		return new PetQueryAiSearchImage(bytes, canonical);
	}

	static fromBuffer(buffer:Uint8Array):PetQueryAiSearchImage{
		PetQueryAiSearchImage._validateContent(buffer);
		return new PetQueryAiSearchImage(Buffer.from(buffer));
	}

	static fromBase64(base64:utf8_t):PetQueryAiSearchImage{
		const value = base64.startsWith('data:')
			? /^data:image\/[a-zA-Z0-9.+-]+;base64,(.*)$/.exec(base64)?.[1]
			: base64;
		const pattern =
			/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?)?$/;
		if(undefined === value || 0 === value.length || !pattern.test(value)){
			throw new TypeError(
				'Expected a non-empty base64 image or image data URI',
			);
		}
		const buffer = Buffer.from(value, 'base64');
		const encoded = buffer.toString('base64');
		if(encoded.replace(/=+$/, '') !== value.replace(/=+$/, '')){
			throw new TypeError('Invalid base64 image encoding');
		}
		return PetQueryAiSearchImage.fromBuffer(buffer);
	}

	protected static _validateContent(bytes:Uint8Array):void{
		if(!(bytes instanceof Uint8Array) || 0 === bytes.length){
			throw new TypeError('Image content must be a non-empty Uint8Array');
		}
	}

	// Return a copy so callers cannot mutate previously constructed content.
	toBuffer():Buffer{
		this._assertNotDestroyed();
		return Buffer.from(this._content);
	}
};
