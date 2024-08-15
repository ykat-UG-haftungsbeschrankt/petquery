const PetQueryModule = require('PetQuery/Module.js');

class PetQueryModulesEuropetnetOrg extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		query = String(query.query).replace(/[^0-9A-Za-z]/g,'');
		if(query == ''){
			return [];
		}

		let ret = [];

		let data = await fetch("https://europetnet.org/apiSearch.php?chipID="+query,{
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"x-requested-with": "XMLHttpRequest",
			},
			"referrer": "https://europetnet.org/",
			"body": null,
			"method": "GET"
		});
		let body = await data.json();

		if(body.userData.Status === true){
			for(const row of body.userData.Data){
				let obj = {
					source:{
						favicon:'https://europetnet.org/favicon.ico'
						,url:'https://europetnet.org'
						,name:'europetnet'
					}
					,data:{
						 ...row
						,...row.MemberDetail
					}
				};

				ret.push(obj);
			}
		}

		return ret;
	}
};

module.exports = PetQueryModulesEuropetnetOrg;
/*
(async function(){
	let cls = new PetQueryModulesEuropetnetOrg({});
	let res = await cls.query({query:'112093400000465'});
	debugger;
}());
*/