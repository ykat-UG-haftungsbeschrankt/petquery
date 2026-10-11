/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';
import {PetQueryJson} from '#petquery/json.js';
import {PetQueryPluginResultSource} from '#petquery/plugin/result/source.js';

export class PetQueryPluginResultEntry{
	static readonly _parser = PetQueryCast.object({
		 source:PetQueryPluginResultSource._instanceParser
		,preview:PetQueryCast.string()
		,files:PetQueryCast.array(PetQueryCast.string())
		,attributes:PetQueryJson.objectParser
	});

	protected _source:PetQueryPluginResultSource;
	protected _preview:uri_t;
	protected _files:uri_t[];
	protected _attributes:json_object_t;
	constructor(
		obj:PetQueryCast.ParseResult<
			typeof PetQueryPluginResultEntry._parser
		>
	){
		this._source = obj.source;
		this._preview = obj.preview;
		this._files = obj.files;
		this._attributes = obj.attributes;
	}
	getSource():PetQueryPluginResultSource{
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
	toJson():json_t{
		return {
			source: this._source.toJson(),
			preview: this._preview,
			files: this._files,
			attributes: this._attributes
		};
	}
	static fromJson(json:unknown):PetQueryPluginResultEntry{
		return new PetQueryPluginResultEntry(
			PetQueryPluginResultEntry._parser.parse(json)
		);
	}
};
