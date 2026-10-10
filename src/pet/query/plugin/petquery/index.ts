import {PetQueryPlugin, PetQueryPluginConfig, PetQueryPluginQuery, PetQueryPluginResult} from '#petquery/plugin.js';

export class PetQueryPluginPetqueryConfig
	extends PetQueryPluginConfig{
	protected _uri:uri_t;
	protected _headers:{ [key: string]: string };
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{uri:uri_t;headers:{ [key: string]: string }}
	){
		super(baseCfg);
		this._uri = cfg.uri;
		this._headers = cfg.headers;
	}
	getUri():uri_t{
		return this._uri;
	}
	getHeaders():{ [key: string]: string }{
		return this._headers;
	}
}

export class PetQueryPluginPetquery extends PetQueryPlugin{
	protected _cfg:PetQueryPluginPetqueryConfig;
	constructor(cfg:PetQueryPluginPetqueryConfig){
		super('petquery',cfg);
		this._cfg = cfg;
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{
		const data = await fetch(this._cfg.getUri(),{
			headers:{
				...{
					 "accept-language": "en-US,en;q=0.9"
					,"cache-control": "max-age=0"
				}
				,...this._cfg.getHeaders()
				,...{
					 "accept": "application/json"
					,"content-type": "application/json"
				}
			}
			,body: JSON.stringify(query.toJson())
			,method: 'POST'
			,signal: AbortSignal.timeout(this.getTimeout())
		});
		if(!data.ok){
			throw new Error(data.statusText);
		}
		return PetQueryPluginResult.fromJson(await data.json());
	}
};