import {PetQueryPlugin, PetQueryPluginConfig, PetQueryPluginQuery, PetQueryPluginResult, PetQueryPluginResultEntry} from '#petquery/plugin.js';
import {PetQueryPluginResultSource} from '#petquery/plugin.js';

export class PetQueryPluginTestConfig
	extends PetQueryPluginConfig{
	protected _ain:string;
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{ain:string;}
	){
		super(baseCfg);
		this._ain = cfg.ain;
	}
	getAin():string{
		return this._ain;
	}
}

export class PetQueryPluginTest extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginTestConfig){
		super('test',cfg);
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{
		return new PetQueryPluginResult([new PetQueryPluginResultEntry({
			source: new PetQueryPluginResultSource({
				favicon: 'https://animalid.by/favicon.ico'
				, url: 'https://animalid.by'
				, name: 'Animalid'
			})
			,preview: ''
			,files: []
			,attributes: {
				name: {
					first: "Bob",
					last: "Smith",
				}
			}
		})]);
	}
};