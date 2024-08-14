const fs = require('fs');
//const { authenticate_api } = require('express-oauth2-jwt-bearer');
//const { authenticate_json } = require('express-oauth2-jwt-bearer');

function authenticate(req, res, next){
	let str = String(req.headers?.authorization).split(' ')[1];
	if(module.exports.authenticate.bearer[str] !== true){
		return res.status(403).end();
	}
	next();
}

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
	,authenticate:{
		bearer:{
			 '75258ce9e0a7e751ce4e78cf20dd3f8f':true
			,'c815512c071af26c864e6af29c2e2080':true
			,'7b6795176a5b09bd80c4ec5ea6f7da6e':true
			,'6d2d50aadc7004131b2992c9df88b1cf':true
			,'764986b1436c3cf81054393ccd666e52':true
			,'11030192d336705d43196b118eed1eac':true
			,'c7c9cb95cbd6b3153955bdd75481a352':true
			,'808d11ed47ec3e9823f0f3fed1ff6978':true
			,'99a7f89c23149355077b0e07e6ee4ac8':true
			,'f3dea1c3d8cd3faab10750fc96b2a5da':true
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
			,authenticate:authenticate
		}
		,json:{
			enabled:true
			,authenticate:authenticate
		}
		,"/":{
			enabled:true
		}
	}
};