export class PetQueryLibStringFormat{
	protected _delimiters:string[];
	protected _escape:Map<string,(val:unknown)=>string>;

	constructor(){
		this._delimiters = ['{','}'];
		this._escape = new Map([
			['default', this._quote]
		]);
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

				if(!key.length){
					return this._delimiters[1];
				}else if(key.length == 1
				      && key == this._delimiters[0]){
					return this._delimiters[0];
				}else if(key.charAt(0) == '@'){
					return arr[key.substring(1)];
				}else if(key.charAt(0) == '#'){
					return '{'+key.substring(1)+'}';
				}else if(key.charAt(0) == '|'){
					var args = key.split('|');
					args.shift();
					var fn = args.shift();
					return this._escape.get(fn).apply(this,args);
				}else if((matches = key.match(/([^|]+)\|(.*)/))
				      && matches.length){
					var str = arr[matches[1].trim()];
					matches[2].split('|').map((val:string)=>{
						str = this._escape.get(val.trim())(str);
					},this);
					return str;
				}else{
					return this._escape.get('default')(arr[key]);
				}
			}
		);
	}
}