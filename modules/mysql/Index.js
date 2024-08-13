const PetQueryModule = require('../../PetQueryModule.js');
const mysql = require('mysql');

class PetQueryModulesMysql extends PetQueryModule {
	constructor(cfg) {
		this._db = null;
		super(cfg);
	}
	async _getConnection() {
		if (this._db === null) {
			this._db = mysql.createConnection(this.getConfigValue('db')
				/*{
				  host: "localhost",
				  user: "yourusername",
				  password: "yourpassword",
				  database: "mydb"
				}*/
			);
			await new Promise((resolve, reject) => {
				this._db.connect(function(err) {
					if (err) {
						reject(err);
					}
					resolve();
				});
			});
		}

		return this._db;
	}
	async _buildSqlQuery(query) {}
	async query(query) {
		let ret = [];
		let db = await this._getConnection();
		let result = await new Promise((resolve, reject) => {
			db.query(await this._buildSqlQuery(query), function(err, result, fields) {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
for(const row of result){
	ret.push({data:row});
}
		return ret;
	}
};

module.exports = PetQueryModulesMysql;
