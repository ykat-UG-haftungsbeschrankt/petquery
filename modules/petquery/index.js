const PetQueryModule = require('PetQuery/Module.js');

class PetQueryModulesTest extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		let data = await fetch(this.getConfigValue('uri'),{
			headers:{
				...{
					 "accept": "application/json"
					,"accept-language": "en-US,en;q=0.9"
					,"cache-control": "max-age=0"
					,"content-type": "application/json"
				}
				,...(this.getConfigValue('headers')||{})
			}
			,body: JSON.stringify(query)
			,method: 'POST'
			,signal: AbortSignal.timeout(this.getConfigValue('timeout')||5000)
		});
		if(!data.ok){
			throw new Error(data.statusText);
		}
		return await data.json();
	}
};

module.exports = PetQueryModulesTest;