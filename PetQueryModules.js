const fs = require("fs");

/** Actually should be singleton to load the modules in ./modules */
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
	/**
	 * Querys all enabled modules in ./modules folder
	 * @param {object} query Moste likely you want to pass is something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} {
			error:[string,string,string]
			,data:[array of return values from PetQueryModule.query]
		}
	 */
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

	/**
	 * Querys single module
	 * @param {string} module the directory name in ./modules
	 * @param {object} query Moste likely you want to pass is something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} example object in PetQueryModule.query function body
	 */
	async queryModule(module,query){
		return await this._modules[module].query(query);
	}
};

module.exports = function(petQueryConfig){
	return new PetQueryModules(petQueryConfig);
};