const PetQueryModule = require('../../module.js');

class PetQueryModulesTest extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		return [{
			source: {
				favicon: 'https://animalid.by/favicon.ico'
				, url: 'https://animalid.by'
				, name: 'test'
			}
			, preview: undefined
			, files: []
			, data: {
				name: {
					first: this.getConfigValue('ain'),
					last: "Smith",
				}
			}
		}, {
			source: {
				favicon: 'https://animalid.by/favicon.ico'
				, url: 'https://animalid.by'
				, name: 'Animalid'
			}
			, preview: undefined
			, files: []
			, data: {
				name: {
					first: "Bob",
					last: "Smith",
				}
			}
		}
		];
	}
};

module.exports = PetQueryModulesTest;
