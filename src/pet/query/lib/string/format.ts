/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryLibStringFormat{
	protected _delimiters:Array<utf8_t>;
	protected _escape:Map<utf8_t,(value:unknown)=>utf8_t>;

	constructor(){
		this._delimiters = ['{','}'];
		this._escape = new Map([
			['default',this._quote.bind(this)]
		]);
	}

	protected _getEscapeFunction(
		name:utf8_t
	):(value:unknown)=>utf8_t{
		const escape = this._escape.get(name);
		if(undefined === escape){
			throw new Error(`Escape function "${name}" is not registered`);
		}
		return escape;
	}

	protected _quote(value:unknown):utf8_t{
		return String(value);
	}

	format(
		text:utf8_t,
		values:Record<utf8_t,unknown>
	):utf8_t{
		const opening = this._delimiters[0];
		const closing = this._delimiters[1];
		return text.replaceAll(
			new RegExp(
				opening
				+'([^'+closing+']*)'
				+closing,
				'gmi'
			),
			this._replacePlaceholder.bind(this,values)
		);
	}

	protected _replacePlaceholder(
		values:Record<utf8_t,unknown>,
		UNUSED_match:utf8_t,
		key:utf8_t
	):utf8_t{
		const opening = this._delimiters[0];
		const closing = this._delimiters[1];
		if(0 === key.length){
			return closing;
		}
		if(1 === key.length && opening === key){
			return opening;
		}
		if('@' === key.charAt(0)){
			return String(values[key.substring(1)]);
		}
		if('#' === key.charAt(0)){
			return opening + key.substring(1) + closing;
		}
		if('|' === key.charAt(0)){
			const args = key.split('|');
			args.shift();
			const name = args.shift() ?? '';
			return this._getEscapeFunction(name)(values[args[0]]);
		}

		const matches = key.match(/([^|]+)\|(.*)/);
		if(null !== matches){
			let value = values[matches[1].trim()];
			for(const name of matches[2].split('|')){
				value = this._getEscapeFunction(name.trim())(value);
			}
			return String(value);
		}
		return this._getEscapeFunction('default')(values[key]);
	}

	destructor():void{
		try{
		}
		catch(UNUSED_e){
		}
	}
};
