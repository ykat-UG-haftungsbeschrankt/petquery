const PetQueryModule = require('../../PetQueryModule.js');
const { MongoClient } = require('mongodb');

class PetQueryModulesMongodb extends PetQueryModule{
	constructor(cfg) {
		this._db = new MongoClient(this.getConfigValue('db').uri
			//'mongodb://localhost:27017'
		);
		super(cfg);
	}
	async _normalizeQuery(obj){
		return obj;
	}
	_normalizeResult(obj){
		return obj;
	}
	async query(query){
		let ret = [];

		await this._db.connect();

		for(const row of
			this._db
				.db(this.getConfigValue('db').name)
				.collection(this.getConfigValue('db').collection)
				.find(await this._normalizeQuery(query))
				.toArray()
		){
			ret.push({
				 source:this.getConfigValue('source')
				,data:this._normalizeResult(row)
			});
		}

		return ret;
	}
};

module.exports = PetQueryModulesMongodb;
