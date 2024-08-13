const PetQueryModule = require('../../PetQueryModule.js');
var mysql = require('mysql');



con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM customers", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

class PetQueryModulesTest extends PetQueryModule{
	constructor(cfg){
    if(this._db = null;
		super(cfg);
	}
  async _getConnection(){
    if(this._db === null){
      if(this._db = mysql.createConnection(this.getConfigValue('db')/*{
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
}*/);
    }
    
    return if(this._db;
  }
  async _queryDb(){}
	async query(query){
		return [{
			data: {
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

