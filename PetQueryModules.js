const fs = require("fs");

class PetQueryModules{
	constructor(petQueryConfig){
		this._cfg = petQueryConfig;
		this._modules = {};

		let dirent;
		const dir = fs.opendirSync('./modules');
		while((dirent = dir.readSync()) !== null){
			if(fs.existsSync('./modules/'+dirent.name+'/index.js')
			&& this._cfg.module[dirent.name]?.enabled !== false){
				console.log('Loading module '+dirent.name);
				let module = require('./modules/'+dirent.name+'/index.js');
				this._modules[dirent.name] = new module(
					this._cfg.module
					? this._cfg.module[dirent.name]
					: undefined
				);
			}
		}
		dir.closeSync();
	}

	async query(query){
		let results = [];
		let ret = {
			error:[]
			,data:[]
		};

		for(const module of Object.values(this._modules)){
			results.push(module.query(query));
		}

		results = await Promise.all(results.map(p => p.catch(e => e)));

		ret.error = results.filter(result => (result instanceof Error));

		for(const result of results.filter(result => !(result instanceof Error))){
			for(const row of result.slice(0,this._cfg.max_results_per_module)){
				ret.data.push(row);
			}
		}

		return ret;
	}

	async queryModule(module,query){
		return await this._modules[module].query(query);
	}
};

module.exports = function(petQueryConfig){
	return new PetQueryModules(petQueryConfig);
};