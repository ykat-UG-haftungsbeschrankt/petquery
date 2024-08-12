/** Base class for all modules in ./modules */
class PetQueryModule{
	constructor(cfg){
		this._cfg = cfg || {};
	}
	/**
	 * @param {string} key Returns value from PetQueryConfig.module["module directory name"]
	 */
	getConfigValue(key){
		if(!this._cfg.hasOwnProperty(key)){
			throw new Error(`Missing config value for "${key}"`);
		}
		return this._cfg[key];
	}
	/**
	 * @param {object} query Most likely you want to pass something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} example object in function body
	 */
	async query(query){
		throw new Error('module must override query function');
		return [{
			source:{
				 favicon:'https://example.com/favicon.ico'
				,url:'https://example.com'
				,name:'example.com'
			}
			,preview:'https://example.com/preview.jpg'
			,files:['https://example.com/fullsize.jpg']
			,data:{
				 firstname:'john'
				,lastname:'doe'
				,email:'john.doe@example.com'
			}
		}];
	}
};

module.exports = PetQueryModule;
