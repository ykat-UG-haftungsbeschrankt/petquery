class PetQueryLibStringFormat{
	constructor(){
		this._delimiters = ['{','}'];
		this._escape = {
			 'default' : this.#quote
		};
	}

	#quote(val){
		return val;
	}

	format(
		 str
		,arr
	){
		return str.replaceAll(
			new RegExp(
				this._delimiters[0]
				+'([^'+this._delimiters[1]+']*)'
				+this._delimiters[1]
				,'gmi'
			),(unused_arg,key)=>{
				var matches;

				if(!key.length){
					return this._delimiters[1];
				}else if(key.length == 1
				      && key == this._delimiters[0]){
					return this._delimiters[0];
				}else if(key.charAt(0) == '@'){
					return arr[key.substr(1)];
				}else if(key.charAt(0) == '#'){
					return '{'+key.substr(1)+'}';
				}else if(key.charAt(0) == '|'){
					var args = key.split('|');
					args.shift();
					var fn = args.shift();
					return this._escape[fn].apply(this,args);
				}else if((matches = key.match(/([^|]+)\|(.*)/))
				      && matches.length){
					var str = arr[matches[1].trim()];
					matches[2].split('|').map((val,index,array)=>{
						str = this._escape[val.trim()](str);
					},this);
					return str;
				}else{
					return this._escape['default'](arr[key]);
				}
			}
		);
	}
}

module.exports = PetQueryLibStringFormat;