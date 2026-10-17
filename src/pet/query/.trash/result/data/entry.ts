/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryJson} from '#petquery/json.js';
import {PetQueryResultDataSource} from '#petquery/result/data/source.js';

export class PetQueryResultDataEntry{
	static readonly _parser = PetQueryCast.object({
		 source:PetQueryResultDataSource._instanceParser
		,preview:PetQueryCast.string()
		,files:PetQueryCast.array(PetQueryCast.string())
		,attributes:PetQueryJson.objectParser
	});

	protected _source:PetQueryResultDataSource;
	protected _preview:uri_t;
	protected _files:uri_t[];
	protected _attributes:json_object_t;
	constructor(
		obj:PetQueryCast.ParseResult<
			typeof PetQueryResultDataEntry._parser
		>
	){
		this._source = obj.source;
		this._preview = obj.preview;
		this._files = obj.files;
		this._attributes = obj.attributes;
	}
	getSource():PetQueryResultDataSource{
		return this._source;
	}
	hasPreview():boolean{
		return this._preview !== '';
	}
	getPreview():uri_t{
		return this._preview;
	}
	getFiles():uri_t[]{
		return this._files;
	}
	getAttributes():json_object_t{
		return this._attributes;
	}
	toJson():json_object_t{
		return {
			source: this._source.toJson(),
			preview: this._preview,
			files: this._files,
			attributes: this._attributes
		};
	}
	static fromJson(json:unknown):PetQueryResultDataEntry{
		return new PetQueryResultDataEntry(
			PetQueryResultDataEntry._parser.parse(json)
		);
	}
	destructor():void{
	}
};
