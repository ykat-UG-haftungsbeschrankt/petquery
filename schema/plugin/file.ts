/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQuerySchema, PetQuerySchemaAbstract} from '#petquery/schema.js';
import type {PetQuerySchemaStatic} from '#petquery/schema.js';

const T = PetQuerySchema.type;

const schema = T.Object({
	 filename:T.String()
	,mime:T.String()
	,size:T.Number({min:0})
	,data:T.String()
	,md5:T.String()
},{
	 title:'GET /api/config/get File'
	,additionalProperties:false
});

const validator = PetQuerySchema.compile(schema);

export type PetQuerySchemaPluginFileType =
	PetQuerySchemaStatic<typeof schema>;

// GET /api/config/get
class PetQuerySchemaPluginFile extends
	PetQuerySchemaAbstract<
		 PetQuerySchemaPluginFileType
	>{
	protected static _instance:
		PetQuerySchemaPluginFile | null = null;
	public static getInstance():PetQuerySchemaPluginFile{
		if(this._instance === null){
			this._instance = new PetQuerySchemaPluginFile();
		}
		return this._instance;
	}
	getSchema(){
		return schema;
	}
	getValidator(){
		return validator;
	}
};

const petQuerySchemaPluginFile =
	PetQuerySchemaPluginFile.getInstance();

export {
	petQuerySchemaPluginFile as PetQuerySchemaPluginFile
};








/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.


import {PetQueryCast} from '#petquery/cast.js';

export class PetQuerySchemaPluginFileQueryFile{
	static readonly _parser = PetQueryCast.object({
		 filename:PetQueryCast.string()
		,mime:PetQueryCast.string()
		,size:PetQueryCast.int({min:0})
		,data:PetQueryCast.string()
		,md5:PetQueryCast.string()
	});
	// Parses straight into an instance, for use as a nested field parser.
	static readonly _instanceParser:
		PetQueryCast.Parser<PetQuerySchemaPluginFileQueryFile> = {
			 type:PetQuerySchemaPluginFileQueryFile._parser.type
			,sampleValue:new PetQuerySchemaPluginFileQueryFile(
				PetQuerySchemaPluginFileQueryFile._parser.sampleValue
			)
			,randomSample:PetQuerySchemaPluginFileQueryFile._randomSample
			,parse:PetQuerySchemaPluginFileQueryFile._parse
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
	destructor():void{
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
	toJson():json_object_t{
		return {
			 filename:this._filename
			,mime:this._mime
			,size:this._size
			,data:this._data
			,md5:this._md5
		};
	}
	static fromJson(json:unknown):PetQuerySchemaPluginFileQueryFile{
		return PetQuerySchemaPluginFileQueryFile._parse(json);
	}
	protected static _parse(
		input:unknown,
		context?:PetQueryCast.ParserContext
	):PetQuerySchemaPluginFileQueryFile{
		return new PetQuerySchemaPluginFileQueryFile(
			PetQuerySchemaPluginFileQueryFile._parser.parse(input,context)
		);
	}
	protected static _randomSample():PetQuerySchemaPluginFileQueryFile{
		return new PetQuerySchemaPluginFileQueryFile(
			PetQuerySchemaPluginFileQueryFile._parser.randomSample()
		);
	}
};
 */