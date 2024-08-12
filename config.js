//const { authenticate_api } = require('express-oauth2-jwt-bearer');
//const { authenticate_json } = require('express-oauth2-jwt-bearer');

module.exports = {
	 port:50000
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
	,api:{
		 module:'test'
		,enabled:false
		,authenticate:authenticate_api
	}
	,json:{
		 enabled:false
		,authenticate:authenticate_json
	}
};
