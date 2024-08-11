const PetQueryModule = require('../../module.js');

class PetQueryModulesError extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){

		//throw new Error("1234");
		return [];
	}
};

module.exports = PetQueryModulesError;
