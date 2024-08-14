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
		//config object for ./modules/test/index.js accessible via this.getConfigValue()
		test:{
			enabled:false
			,ain:1234
		}
		//config object for ./modules/error/index.js accessible via this.getConfigValue()
		,error:{
			enabled:false
		}
		,mongodb:{
			enabled:false
		}
		,mysql:{
			enabled:false
		}
		//config object for ./modules/petquery/index.js accessible via this.getConfigValue()
		,petquery:{
			enabled:false
		}
	}
	,route:{
		api:{
			module:'test'
			,enabled:true
			,authenticate:false//authenticate_api
		}
		,json:{
			enabled:true
			,authenticate:false//authenticate_json
		}
		,"/":{
			enabled:true
		}
	}
};