const PetQueryModule = require('../../module.js');

class PetQueryModulesTest extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		return [{
				name: {
					first: "Bob",
					last: "Smith",
				}
			},{
				name: {
					first: "Bob",
					last: "Smith",
				}
			}
		];
	}
};

module.exports = PetQueryModulesTest;
