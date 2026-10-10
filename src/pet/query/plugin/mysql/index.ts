import {
	PetQueryPlugin,
	PetQueryPluginConfig,
	PetQueryPluginQuery,
	PetQueryPluginResult,
    PetQueryPluginResultEntry
} from '#petquery/plugin.js';
import {PetQueryLibStringFormat} from
	'#petquery/string/format.js';
import {
	escape,
	escapeId,
	type SqlValue
} from 'mysql2';
import Mysql2Async, {
	type DbConfig
} from 'mysql2-async';

class PetQueryModulesMysqlFormat extends PetQueryLibStringFormat{
	constructor(){
		super();

		this._delimiters = ['{','}'];
		this._escape = new Map([
			 ['default', (value:unknown)=>escape(String(value) as SqlValue)]
			,['id', (value:unknown)=>escapeId(String(value))]
		]);
	}
}

export class PetQueryPluginMysqlConfig
	extends PetQueryPluginConfig{
	protected _dbCfg:DbConfig | string;
	protected _query:string;
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{dbCfg:DbConfig | string;query:string;}
	){
		super(baseCfg);
		this._dbCfg = cfg.dbCfg;
		this._query = cfg.query;
	}
	getDbCfg():DbConfig | string{
		return this._dbCfg;
	}
	getQuery():string{
		return this._query;
	}
}

export class PetQueryPluginMysql extends PetQueryPlugin{
	constructor(cfg:PetQueryPluginMysqlConfig){
		super('mysql',cfg);
		this._db = null;
		this._template = new PetQueryModulesMysqlFormat();
		this._cfg = cfg;
	}
	protected _cfg:PetQueryPluginMysqlConfig;
	protected _db:Mysql2Async|null;
	protected _template:PetQueryModulesMysqlFormat;
	protected _normalizeDbConfig(dbCfg:DbConfig|string):DbConfig{
		if(typeof dbCfg !== 'string'){
			return dbCfg;
		}

		const uri = new URL(dbCfg);
		if(uri.protocol !== 'mysql:'){
			throw new Error('MySQL connection URI must use mysql:');
		}

		return {
			 host:uri.hostname
			,user:decodeURIComponent(uri.username)
			,password:decodeURIComponent(uri.password)
			,database:decodeURIComponent(uri.pathname.replace(/^\/+/, ''))
			,...(uri.port ? {port:Number(uri.port)} : {})
		};
	}
	protected async _getConnection():Promise<Mysql2Async>{
		if(this._db === null){
			this._db = new Mysql2Async(
				this._normalizeDbConfig(this._cfg.getDbCfg())
			);
		}

		return this._db;
	}
	protected async _normalizeQuery(obj:PetQueryPluginQuery):Promise<string>{
		return this._template.format(
			 this._cfg.getQuery()
			,obj.toJson()
		);
	}
	protected _normalizeResult(obj:json_object_t):PetQueryPluginResultEntry{
		return new PetQueryPluginResultEntry({
			 source:this.getSource()
			,preview:''
			,files:[]
			,attributes:obj
		});
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{
		const ret = [];
		const db = await this._getConnection();
		const result = await db.getall<json_object_t>(
			await this._normalizeQuery(query)
		);

		for(const row of result){
			ret.push(this._normalizeResult(row));
		}

		return new PetQueryPluginResult(ret);
	}
};