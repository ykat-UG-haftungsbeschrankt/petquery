const PetQueryModule = require('../../PetQueryModule.js');
const PetQueryLibStringFormat = require('../../PetQueryLibStringFormat.js');
const mysql = require('mysql');

class PetQueryModulesMysqlFormat extends PetQueryLibStringFormat{
	constructor(){
		super();

		this._delimiters = ['{','}'];
		this._escape = {
			 'default' : mysql.escape
			,'id' : mysql.escapeId
		};
	}
}

class PetQueryModulesMysql extends PetQueryModule{
	constructor(cfg){
		this._db = null;
		this._template = new PetQueryModulesMysqlFormat();
		super(cfg);
	}
	async _getConnection(){
		if(this._db === null){
			this._db = mysql.createPool(this.getConfigValue('db')
				/*{
				  host: "localhost",
				  user: "yourusername",
				  password: "yourpassword",
				  database: "mydb"
				}*/
			);/*
			await new Promise((resolve, reject) => {
				this._db.connect(function(err) {
					if (err) {
						reject(err);
					}
					resolve();
				});
			});*/
		}

		return this._db;
	}
	async _normalizeQuery(obj){
		return this._template.format(
			 this.getConfigValue('query')
			,obj
		);
	}
	_normalizeResult(obj){
		return obj;
	}
	async query(query){
		let ret = [];
		let db = await this._getConnection();
		let result = await new Promise(async (resolve, reject)=>{
			db.query(
				 await this._normalizeQuery(query)
				,function(err, result, fields){
					if(err){
						reject(err);
					}
					resolve(result);
				}
			);
		});

		for(const row of result){
			ret.push({
				 source:this.getConfigValue('source')
				,data:this._normalizeResult(row)
			});
		}

		return ret;
	}
};

module.exports = PetQueryModulesMysql;
