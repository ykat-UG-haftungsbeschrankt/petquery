/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

// Encoded content; model-specific preprocessing belongs to the encoder.
export class PetQueryAiSearchImage extends PetQueryDestructor{
	protected _content:Buffer;

	protected constructor(content:Buffer){
		super();
		this._content = content;
	}

	public override async _destructor():Promise<void>{
		try{
			this._content = Buffer.alloc(0);
		}
		catch(UNUSED_e){
		}
	}

	static fromBuffer(buffer:Uint8Array):PetQueryAiSearchImage{
		return new PetQueryAiSearchImage(Buffer.from(buffer));
	}

	static fromBase64(base64:base64_t):PetQueryAiSearchImage{
		return PetQueryAiSearchImage.fromBuffer(Buffer.from(base64, 'base64'));
	}

	toBuffer():Buffer{
		this._assertNotDestroyed();
		return Buffer.from(this._content);
	}
};
