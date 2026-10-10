import {PetQueryPlugin, PetQueryPluginConfig, PetQueryPluginQuery, PetQueryPluginResult} from '#petquery/plugin.js';

export class PetQueryPluginErrorConfig
	extends PetQueryPluginConfig{
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
	){
		super(baseCfg);
	}
}

export class PetQueryPluginError extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginErrorConfig){
		super('error',cfg);
	}
	override async query(UNUSED_query:PetQueryPluginQuery):Promise<PetQueryPluginResult[]>{

		//throw new Error("1234");
		return [];
	}
};