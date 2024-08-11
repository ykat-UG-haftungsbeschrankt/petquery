class PetQueryModule{
	constructor(cfg){
		this._cfg = cfg || {};
	}
	getConfigValue(key){
		if(!this._cfg.hasOwnProperty(key)){
			throw new Error(`Missing config value for "${key}"`);
		}
		return this._cfg[key];
	}
	async query(){
	}
}
module.exports = PetQueryModule;