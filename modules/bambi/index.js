const PetQueryModule = require('../../module.js');

class PetQueryModulesBambi extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		if(query.query != this.getConfigValue('ain')){
			return [];
		}

		return [{
				 name: 'Bambi'
				,address:{
					 street: 'Neufeldstraße 22'
					,city: 'Olching'
					,postcode: 82140
					,country: 'Germany'
				}
			}
		];
	}
};

module.exports = PetQueryModulesBambi;
