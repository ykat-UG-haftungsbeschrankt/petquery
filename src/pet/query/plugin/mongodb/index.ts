import {PetQueryPlugin, PetQueryPluginConfig, PetQueryPluginQuery, PetQueryPluginResult, PetQueryPluginResultEntry} from '#petquery/plugin.js';
import {Filter, MongoClient, Document} from 'mongodb';

export class PetQueryPluginMongodbConfig
	extends PetQueryPluginConfig{
	protected _uri:uri_t;
	protected _db:string;
	protected _collection:string;
	constructor(
		 baseCfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]
		,cfg:{uri:uri_t;db:string;collection:string;}
	){
		super(baseCfg);
		this._uri = cfg.uri;
		this._db = cfg.db;
		this._collection = cfg.collection;
	}
	getUri():uri_t{
		return this._uri;
	}
	getDb():string{
		return this._db;
	}
	getCollection():string{
		return this._collection;
	}
}

export class PetQueryPluginMongodb extends PetQueryPlugin{
	private _cfg:PetQueryPluginMongodbConfig;
	constructor(cfg:PetQueryPluginMongodbConfig){
		super('mongodb',cfg);
		this._cfg = cfg;
		this._db = new MongoClient(cfg.getUri()
			//'mongodb://localhost:27017'
		);
	}
	protected _db:MongoClient;
	_normalizeQuery(obj:PetQueryPluginQuery):Filter<Document>{
		return {
			uid:{
				$eq: obj.getQuery().trim()
			}
		};
	}
	_normalizeResult(obj:json_object_t):PetQueryPluginResultEntry{
		return new PetQueryPluginResultEntry({
			 source:this.getSource()
			,preview:''
			,files:[]
			,attributes:obj
		});
	}
	override async query(query:PetQueryPluginQuery):Promise<PetQueryPluginResult>{
		const ret = [];

		await this._db.connect();

		for(const row of
			await this._db
				.db(this._cfg.getDb())
				.collection(this._cfg.getCollection())
				.find(this._normalizeQuery(query))
				.toArray()
		){
			ret.push(this._normalizeResult(row));
		}

		return new PetQueryPluginResult(ret);
	}
};