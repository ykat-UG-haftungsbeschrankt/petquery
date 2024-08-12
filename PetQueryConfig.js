const fs = require('fs');
//const { authenticate_api } = require('express-oauth2-jwt-bearer');
//const { authenticate_json } = require('express-oauth2-jwt-bearer');

module.exports = {
	 http:{
		 port:50000
		,enabled:true
	 }
	,https:{
		 port:50000
		,enabled:false
		,certificate:{
			// cert:fs.readFileSync("/etc/letsencrypt//fullchain.pem")
			//,key:fs.readFileSync("/etc/letsencrypt//privkey.pem")
		}
	}
	,max_results_per_module:10
	,max_results_total:1000
	,module:{
		test:{
			ain:1234
			,enabled:false
		}
		,error:{
			enabled:false
		}
	}
	,route:{
		api:{
			module:'test'
			,enabled:false
			,authenticate:false//authenticate_api
		}
		,json:{
			enabled:false
			,authenticate:false//authenticate_json
		}
		,"/":{
			enabled:false
		}
	}
};
