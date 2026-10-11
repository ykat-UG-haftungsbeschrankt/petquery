/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryCast} from '#petquery/cast.js';

export class PetQueryResultDataSource{
	static readonly _parser = PetQueryCast.object({
		 favicon:PetQueryCast.string()
		,url:PetQueryCast.string()
		,name:PetQueryCast.string()
	});
	// Parses straight into an instance, for use as a nested field parser.
	static readonly _instanceParser:
		PetQueryCast.Parser<PetQueryResultDataSource> = {
			 type:PetQueryResultDataSource._parser.type
			,sampleValue:new PetQueryResultDataSource(
				PetQueryResultDataSource._parser.sampleValue
			)
			,randomSample:PetQueryResultDataSource._randomSample
			,parse:PetQueryResultDataSource._parse
		};

	protected _favicon:uri_t;
	protected _url:uri_t;
	protected _name:string;
	constructor(
		obj:PetQueryCast.ParseResult<
			typeof PetQueryResultDataSource._parser
		>
	){
		this._favicon = obj.favicon;
		this._url = obj.url;
		this._name = obj.name;
	}
	hasFavicon():boolean{
		return this._favicon !== '';
	}
	getFavicon():uri_t{
		return this._favicon;
	}
	hasUrl():boolean{
		return this._url !== '';
	}
	getUrl():uri_t{
		return this._url;
	}
	getName():string{
		return this._name;
	}
	toJson(){
		return {
			favicon: this._favicon,
			url: this._url,
			name: this._name
		};
	}
	static fromJson(json:unknown):PetQueryResultDataSource{
		return PetQueryResultDataSource._parse(json);
	}
	protected static _parse(
		input:unknown,
		context?:PetQueryCast.ParserContext
	):PetQueryResultDataSource{
		return new PetQueryResultDataSource(
			PetQueryResultDataSource._parser.parse(input,context)
		);
	}
	protected static _randomSample():PetQueryResultDataSource{
		return new PetQueryResultDataSource(
			PetQueryResultDataSource._parser.randomSample()
		);
	}
};
