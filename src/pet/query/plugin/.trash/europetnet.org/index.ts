import {PetQueryPlugin, PetQueryPluginConfig, PetQueryPluginQuery, PetQueryPluginResult} from '#petquery/plugin.js';

export class PetQueryPluginEuropetnetOrgConfig
	extends PetQueryPluginConfig{
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
	){
		super(baseCfg);
	}
}

export class PetQueryPluginEuropetnetOrg extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginEuropetnetOrgConfig){
		super('europetnet.org',cfg);
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult[]>{
		const queryId = String(query.getQuery()).replace(/[^0-9A-Za-z]/g,'');
		if(queryId === ''){
			return [];
		}

		const ret = [];

		const data = await fetch("https://europetnet.org/apiSearch.php?chipID="+queryId,{
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"x-requested-with": "XMLHttpRequest",
			},
			"referrer": "https://europetnet.org/",
			"body": null,
			"method": "GET",
			signal: AbortSignal.timeout(this.getTimeout())
		});
		const body = await data.json();

		if(body.userData.Status === true){
			for(const row of body.userData.Data){
				const obj:unknown = {
					source:{
						favicon:'https://europetnet.org/templates/t3_bs3_blank/favicon.ico'
						,url:'https://europetnet.org'
						,name:'europetnet'
					}
					,data:{
						 ...row
					}
				};
				Object.keys(row?.MemberDetail||{}).forEach(function(key, index) {
					obj.data["MemberDetail"+key] = row.MemberDetail[key];
				});

				delete obj.data.MemberDetail;

				ret.push(obj);
			}
		}

		return ret;
	}
};
/*
(async function(){
	const cls = new PetQueryModulesEuropetnetOrg({});
	const res = await cls.query({query:'112093400000465'});
	debugger;
}());
*/
