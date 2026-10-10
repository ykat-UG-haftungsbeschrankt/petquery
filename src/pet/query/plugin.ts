import { PetQueryAssert } from "./assert.js";
import { PetQueryJson } from "./json.js";

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
};

export class PetQueryPluginQuery{
	protected _query:string;
	protected _bearer:string;
	protected _files:Array<PetQueryPluginQueryFile>;
	protected _iframe:boolean;

	constructor(obj:{query:string, bearer:string, files:Array<PetQueryPluginQueryFile>, iframe:boolean}){
		this._query = obj.query;
		this._bearer = obj.bearer;
		this._files = obj.files;
		this._iframe = obj.iframe;
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
				data: file.getData()
			})),
			iframe: this._iframe
		};
	}
};

export class PetQueryPluginResultSource{
	protected _favicon:uri_t;
	protected _url:uri_t;
	protected _name:string;
	constructor(obj:{favicon:uri_t, url:uri_t, name:string}){
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
		PetQueryJson.assertObject(json);
		PetQueryJson.assertString(json.favicon);
		PetQueryJson.assertString(json.url);
		PetQueryJson.assertString(json.name);
		return new PetQueryPluginResultSource({
			favicon: json.favicon,
			url: json.url,
			name: json.name
		});
	}
};

export class PetQueryPluginResultEntry{
	protected _source:PetQueryPluginResultSource;
	protected _preview:uri_t;
	protected _files:uri_t[];
	protected _attributes:json_object_t;
	constructor(obj:{source:PetQueryPluginResultSource, preview:uri_t, files:uri_t[], attributes:json_object_t}){
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
		PetQueryJson.assertObject(json);
		PetQueryJson.assertObject(json.source);
		PetQueryJson.assertString(json.preview);
		PetQueryJson.assertArray(json.files);
		for(const file of json.files){
			PetQueryJson.assertString(file);
		}
		PetQueryJson.assertObject(json.attributes);
		return new PetQueryPluginResultEntry({
			source: PetQueryPluginResultSource.fromJson(
				json.source
			),
			preview: json.preview,
			files: json.files as uri_t[],
			attributes: json.attributes
		});
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

		PetQueryJson.assertArray(json);
		for(const item of json){
			PetQueryJson.assertObject(item);
			PetQueryJson.assertString(item.preview);
			PetQueryJson.assertArray(item.files);
			for(const file of item.files){
				PetQueryJson.assertString(file);
			}
			PetQueryJson.assertObject(item.attributes);
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
