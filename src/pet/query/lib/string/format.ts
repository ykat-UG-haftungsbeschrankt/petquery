/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryLibStringFormat{
	protected _delimiters:string[];
	protected _escape:Map<string,(val:unknown)=>string>;

	constructor(){
		this._delimiters = ['{','}'];
		this._escape = new Map([
			['default', this._quote]
		]);
	}

	protected _getEscapeFunction(fn:string):((val:unknown)=>string){
		const escape = this._escape.get(fn);
		if(undefined === escape){
			throw new Error(`Escape function "${fn}" is not registered`);
		}
		return escape;
	}

	protected _quote(val:unknown):string{
		return String(val);
	}

	format(
		str:string,
		arr:Record<string,unknown>
	):string{
		return str.replaceAll(
			new RegExp(
				this._delimiters[0]
				+'([^'+this._delimiters[1]+']*)'
				+this._delimiters[1]
				,'gmi'
			),
			this._replacePlaceholder.bind(this,arr)
		);
	}

	protected _replacePlaceholder(
		arr:Record<string,unknown>,
		UNUSED_match:string,
		key:string
	):string{
		const opening = this._delimiters[0];
		const closing = this._delimiters[1];
		if(0 === key.length){
			return closing;
		}
		if(1 === key.length && opening === key){
			return opening;
		}
		if('@' === key.charAt(0)){
			return String(arr[key.substring(1)]);
		}
		if('#' === key.charAt(0)){
			return '{'+key.substring(1)+'}';
		}
		if('|' === key.charAt(0)){
			const args = key.split('|');
			args.shift();
			const fn = args.shift() ?? '';
			return this._getEscapeFunction(fn)(arr[args[0]]);
		}

		const matches = key.match(/([^|]+)\|(.*)/);
		if(null !== matches && 0 < matches.length){
			let value = arr[matches[1].trim()];
			for(const name of matches[2].split('|')){
				value = this._getEscapeFunction(name.trim())(value);
			}
			return String(value);
		}
		return this._getEscapeFunction('default')(arr[key]);
	}
	destructor():void{
	}
};