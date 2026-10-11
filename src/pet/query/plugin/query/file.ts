/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';

export class PetQueryPluginQueryFile{
	static readonly _parser = PetQueryCast.object({
		 filename:PetQueryCast.string()
		,mime:PetQueryCast.string()
		,size:PetQueryCast.int({min:0})
		,data:PetQueryCast.string()
		,md5:PetQueryCast.string()
	});
	// Parses straight into an instance, for use as a nested field parser.
	static readonly _instanceParser:
		PetQueryCast.Parser<PetQueryPluginQueryFile> = {
			 type:PetQueryPluginQueryFile._parser.type
			,sampleValue:new PetQueryPluginQueryFile(
				PetQueryPluginQueryFile._parser.sampleValue
			)
			,randomSample:PetQueryPluginQueryFile._randomSample
			,parse:PetQueryPluginQueryFile._parse
		};

	protected _filename:filename_t;
	protected _mime:mime_t;
	protected _size:number;
	protected _data:base64_t;
	protected _md5:md5_hex_string_t;
	constructor(obj:{
		 filename:filename_t
		,mime:mime_t
		,size:number
		,data:base64_t
		,md5:md5_hex_string_t
	}){
		this._filename = obj.filename;
		this._mime = obj.mime;
		this._size = obj.size;
		this._data = obj.data;
		this._md5 = obj.md5;
	}
	getFilename():filename_t{
		return this._filename;
	}
	getMime():mime_t{
		return this._mime;
	}
	getSize():number{
		return this._size;
	}
	getData():base64_t{
		return this._data;
	}
	getMd5():md5_hex_string_t{
		return this._md5;
	}
	static fromJson(json:unknown):PetQueryPluginQueryFile{
		return PetQueryPluginQueryFile._parse(json);
	}
	protected static _parse(
		input:unknown,
		context?:PetQueryCast.ParserContext
	):PetQueryPluginQueryFile{
		return new PetQueryPluginQueryFile(
			PetQueryPluginQueryFile._parser.parse(input,context)
		);
	}
	protected static _randomSample():PetQueryPluginQueryFile{
		return new PetQueryPluginQueryFile(
			PetQueryPluginQueryFile._parser.randomSample()
		);
	}
};
