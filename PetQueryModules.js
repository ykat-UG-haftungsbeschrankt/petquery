const fs = require("fs");

class PetQueryModules{
	constructor(){
		let modules = {};
		let dirent;

		const dir = fs.opendirSync('./modules');
		while((dirent = dir.readSync()) !== null){
			if(fs.existsSync('./modules/'+dirent.name+'/index.js')
			&& config.module[dirent.name]?.enabled !== false){
				console.log('Loading module '+dirent.name);
				let module = require('./modules/'+dirent.name+'/index.js');
				modules[dirent.name] = new module(
					config.module
					? config.module[dirent.name]
					: undefined
				);
			}
		}
		dir.closeSync();

		this._modules = modules;
	}

	async query(query){
		let results = [];
		let ret = {
			error:[]
			,data:[]
		};

		for(module of this._modules.values()){
			results.push(module.query(query));
		}

		results = await Promise.all(results.map(p => p.catch(e => e)));

		ret.error = results.filter(result => (result instanceof Error));

		for(const result of results.filter(result => !(result instanceof Error))){
			for(row of result.slice(0,config.max_results_per_module)){
				ret.data.push(row);
			}
		}

		return ret;
	}

	async queryModule(module,query){
		return await this._modules[module].query(query);
	}
}

module.exports = new PetQueryModules();