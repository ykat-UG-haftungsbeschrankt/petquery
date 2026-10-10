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
		if(!this._escape.has(fn)){
			throw new Error(`Escape function "${fn}" is not registered`);
		}
		return this._escape.get(fn)!;
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
			),(unused_arg:string,key:string)=>{
				var matches;
				var ret = '';

				if(!key.length){
					ret = this._delimiters[1];
				}else if(key.length == 1
				      && key == this._delimiters[0]
				){
					ret = this._delimiters[0];
				}else if(key.charAt(0) == '@'){
					ret = String(arr[key.substring(1)]);
				}else if(key.charAt(0) == '#'){
					ret = '{'+key.substring(1)+'}';
				}else if(key.charAt(0) == '|'){
					var args = key.split('|');
					args.shift();
					var fn = args.shift() ?? '';
					ret = this._getEscapeFunction(fn)(arr[args[0]]);
				}else if(null !== (matches = key.match(/([^|]+)\|(.*)/))
				      && matches.length
				){
					var str = arr[matches[1].trim()];
					matches[2].split('|').map((val:string)=>{
						str = this._getEscapeFunction(val.trim())(str);
					},this);
					ret = String(str);
				}else{
					ret = this._getEscapeFunction('default')(arr[key]);
				}

				return ret;
			}
		);
	}
}