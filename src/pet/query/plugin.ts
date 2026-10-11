import { PetQueryJson } from "./json.js";
import { PetQueryCast } from "./cast.js";

export class PetQueryPluginConfig{
	private _enabled:boolean;
	private _timeout:milliseconds_t;
	private _source:PetQueryPluginResultSource;
	constructor(obj:{
		 enabled:boolean
		,timeout:milliseconds_t
		,source:PetQueryPluginResultSource
	}){
		this._enabled = obj.enabled;
		this._timeout = obj.timeout;
		this._source = obj.source;
	}
	isEnabled():boolean{
		return this._enabled !== false;
	}
	getTimeout():milliseconds_t{
		return this._timeout;
	}
	getSource():PetQueryPluginResultSource{
		return this._source;
	}
};

export class PetQueryPluginQueryFile{
	static readonly _parser = PetQueryCast.object({
		 filename:PetQueryCast.string()
		,mime:PetQueryCast.string()
		,size:PetQueryCast.int({min:0})
		,data:PetQueryCast.string()
		,md5:PetQueryCast.string()
	});
	// Parses straight into an instance, for use as a nested field parser.
	static readonly _instanceParser:
		PetQueryCast.Parser<PetQueryPluginQueryFile> = {
			 type:PetQueryPluginQueryFile._parser.type
			,sampleValue:new PetQueryPluginQueryFile(
				PetQueryPluginQueryFile._parser.sampleValue
			)
			,randomSample:PetQueryPluginQueryFile._randomSample
			,parse:PetQueryPluginQueryFile._parse
		};

	protected _filename:filename_t;
	protected _mime:mime_t;
	protected _size:number;
	protected _data:base64_t;
	protected _md5:md5_hex_string_t;
	constructor(obj:{filename:filename_t, mime:mime_t, size:number, data:base64_t, md5:md5_hex_string_t}){
		this._filename = obj.filename;
		this._mime = obj.mime;
		this._size = obj.size;
		this._data = obj.data;
		this._md5 = obj.md5;
	}
	getFilename():filename_t{
		return this._filename;
	}
	getMime():mime_t{
		return this._mime;
	}
	getSize():number{
		return this._size;
	}
	getData():base64_t{
		return this._data;
	}
	getMd5():md5_hex_string_t{
		return this._md5;
	}
	static fromJson(json:unknown):PetQueryPluginQueryFile{
		return PetQueryPluginQueryFile._parse(json);
	}
	protected static _parse(
		input:unknown,
		context?:PetQueryCast.ParserContext
	):PetQueryPluginQueryFile{
		return new PetQueryPluginQueryFile(
			PetQueryPluginQueryFile._parser.parse(input,context)
		);
	}
	protected static _randomSample():PetQueryPluginQueryFile{
		return new PetQueryPluginQueryFile(
			PetQueryPluginQueryFile._parser.randomSample()
		);
	}
};

export class PetQueryPluginQuery{
	static readonly _uuidParser = PetQueryCast.string({
		 match:/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
		,sampleValue:'00000000-0000-0000-0000-000000000000'
	});
	static readonly _parser = PetQueryCast.object({
		 query:PetQueryCast.string()
		,bearer:PetQueryCast.string()
		,files:PetQueryCast.array(PetQueryPluginQueryFile._instanceParser)
		// Strict: PetQueryCast.boolean() treats any non-empty string as true.
		,iframe:PetQueryCast.values([true,false])
		,serverUuid:PetQueryPluginQuery._uuidParser
		,tracerouteUuid:PetQueryCast.array(PetQueryPluginQuery._uuidParser)
	});

	protected _query:string;
	protected _bearer:string;
	protected _files:Array<PetQueryPluginQueryFile>;
	protected _iframe:boolean;
	protected _serverUuid:uuid_t;
	protected _tracerouteUuid:Set<uuid_t>;

	constructor(obj:{
		query:string,
		bearer:string,
		files:Array<PetQueryPluginQueryFile>,
		iframe:boolean,
		serverUuid:uuid_t,
		tracerouteUuid:Set<uuid_t>
	}){
		this._query = obj.query;
		this._bearer = obj.bearer;
		this._files = obj.files;
		this._iframe = obj.iframe;
		this._serverUuid = obj.serverUuid;
		this._tracerouteUuid = obj.tracerouteUuid;
	}
	getServerUuid():uuid_t{
		return this._serverUuid;
	}
	getTracerouteUuid():Set<uuid_t>{
		return this._tracerouteUuid;
	}
	isCircularQuery():boolean{
		return this._tracerouteUuid.has(this._serverUuid);
	}
	getQuery():string{
		return this._query;
	}
	getBearer():string{
		return this._bearer;
	}
	getFiles():Array<PetQueryPluginQueryFile>{
		return this._files;
	}
	isIframe():boolean{
		return this._iframe;
	}
	toJson(){
		return {
			query: this._query,
			bearer: this._bearer,
			files: this._files.map(file => ({
				filename: file.getFilename(),
				mime: file.getMime(),
				size: file.getSize(),
				data: file.getData(),
				md5: file.getMd5()
			})),
			iframe: this._iframe,
			serverUuid: this._serverUuid,
			tracerouteUuid: [...this._tracerouteUuid]
		};
	}
	static fromJson(json:unknown):PetQueryPluginQuery{
		const obj = PetQueryPluginQuery._parser.parse(json);
		return new PetQueryPluginQuery({
			 query:obj.query
			,bearer:obj.bearer
			,files:obj.files
			,iframe:obj.iframe
			,serverUuid:obj.serverUuid
			,tracerouteUuid:new Set(obj.tracerouteUuid)
		});
	}
};

export class PetQueryPluginResultSource{
	static readonly _parser = PetQueryCast.object({
		 favicon:PetQueryCast.string()
		,url:PetQueryCast.string()
		,name:PetQueryCast.string()
	});
	// Parses straight into an instance, for use as a nested field parser.
	static readonly _instanceParser:
		PetQueryCast.Parser<PetQueryPluginResultSource> = {
			 type:PetQueryPluginResultSource._parser.type
			,sampleValue:new PetQueryPluginResultSource(
				PetQueryPluginResultSource._parser.sampleValue
			)
			,randomSample:PetQueryPluginResultSource._randomSample
			,parse:PetQueryPluginResultSource._parse
		};

	protected _favicon:uri_t;
	protected _url:uri_t;
	protected _name:string;
	constructor(
		obj:PetQueryCast.ParseResult<
			typeof PetQueryPluginResultSource._parser
		>
	){
		this._favicon = obj.favicon;
		this._url = obj.url;
		this._name = obj.name;
	}
	hasFavicon():boolean{
		return this._favicon !== '';
	}
	getFavicon():uri_t{
		return this._favicon;
	}
	hasUrl():boolean{
		return this._url !== '';
	}
	getUrl():uri_t{
		return this._url;
	}
	getName():string{
		return this._name;
	}
	toJson(){
		return {
			favicon: this._favicon,
			url: this._url,
			name: this._name
		};
	}
	static fromJson(json:unknown):PetQueryPluginResultSource{
		return PetQueryPluginResultSource._parse(json);
	}
	protected static _parse(
		input:unknown,
		context?:PetQueryCast.ParserContext
	):PetQueryPluginResultSource{
		return new PetQueryPluginResultSource(
			PetQueryPluginResultSource._parser.parse(input,context)
		);
	}
	protected static _randomSample():PetQueryPluginResultSource{
		return new PetQueryPluginResultSource(
			PetQueryPluginResultSource._parser.randomSample()
		);
	}
};

export class PetQueryPluginResultEntry{
	static readonly _parser = PetQueryCast.object({
		 source:PetQueryPluginResultSource._instanceParser
		,preview:PetQueryCast.string()
		,files:PetQueryCast.array(PetQueryCast.string())
		,attributes:PetQueryJson.objectParser
	});

	protected _source:PetQueryPluginResultSource;
	protected _preview:uri_t;
	protected _files:uri_t[];
	protected _attributes:json_object_t;
	constructor(
		obj:PetQueryCast.ParseResult<
			typeof PetQueryPluginResultEntry._parser
		>
	){
		this._source = obj.source;
		this._preview = obj.preview;
		this._files = obj.files;
		this._attributes = obj.attributes;
	}
	getSource():PetQueryPluginResultSource{
		return this._source;
	}
	hasPreview():boolean{
		return this._preview !== '';
	}
	getPreview():uri_t{
		return this._preview;
	}
	getFiles():uri_t[]{
		return this._files;
	}
	getAttributes():json_object_t{
		return this._attributes;
	}
	toJson():json_t{
		return {
			source: this._source.toJson(),
			preview: this._preview,
			files: this._files,
			attributes: this._attributes
		};
	}
	static fromJson(json:unknown):PetQueryPluginResultEntry{
		return new PetQueryPluginResultEntry(
			PetQueryPluginResultEntry._parser.parse(json)
		);
	}
};

export class PetQueryPluginResult{
	protected _data;
	constructor(data:PetQueryPluginResultEntry[]){
		this._data = data;
	}
	getData(){
		return this._data;
	}
	toJson(){
		const ret:json_array_t = [];
		for(const item of this._data){
			ret.push(item.toJson());
		}
		return ret;
	}
	static fromJson(json:unknown):PetQueryPluginResult{
		const results:PetQueryPluginResultEntry[] = [];
		const items = PetQueryCast.array(
			PetQueryJson.objectParser
		).parse(json);

		for(const item of items){
			results.push(PetQueryPluginResultEntry.fromJson(item));
		}

		return new PetQueryPluginResult(results);
	}
};

export abstract class PetQueryPlugin{
	private readonly _name:string;
	private readonly _baseCfg:PetQueryPluginConfig;

	constructor(name:string, cfg:PetQueryPluginConfig){
		this._name = name;
		this._baseCfg = cfg;
	}
	getName():string{
		return this._name;
	}
	getTimeout():milliseconds_t{
		return this._baseCfg.getTimeout();
	}
	isEnabled():boolean{
		return this._baseCfg.isEnabled();
	}
	getSource():PetQueryPluginResultSource{
		return this._baseCfg.getSource();
	}
	/**
	 * @param {object} query Most likely you want to pass something like https://www.mongodb.com/docs/manual/tutorial/query-documents/
	 * @return {object} example object in function body
	 */
	abstract query(
		query:PetQueryPluginQuery
	):Promise<PetQueryPluginResult>;
};
