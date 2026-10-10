import {default as Express} from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import https from 'node:https';
import util from 'node:util';
import {PetQueryLib} from '#petquery/lib.js';
import {PetQueryPlugin, PetQueryPluginQueryFile} from '#petquery/plugin.js';
import {PetQueryTypes} from '#petquery/types.js';
import {PetQueryPluginQuery, PetQueryPluginResult} from '#petquery/plugin.js';
import { PetQueryConfigServerType } from '#petquery/config.js';
import { PetQueryAssert } from '#petquery/assert.js';

export type PetQueryServerRequest = Express.Request & {
	petQueryPluginQuery?: PetQueryPluginQuery;
};
export type PetQueryServerResponse = Express.Response;

export type PetQueryResult = {
	error:unknown[];
	data:PetQueryPluginResult[];
};

export class PetQueryServer{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _app:Express.Express;
	protected readonly _plugins:Map<string,PetQueryPlugin>;

	constructor(config:PetQueryConfigServerType){
		this._config = config;
		this._app = Express();
		this._plugins = new Map();
	}

	addPlugin(plugin:PetQueryPlugin):void{
		if(!plugin.isEnabled()){
			return;
		}
		if(this._plugins.has(plugin.getName())){
			throw new Error(`Plugin "${plugin.getName()}" is already registered`);
		}
		this._plugins.set(plugin.getName(),plugin);
	}

	start():void{
		this._app.use(Express.json());
		this._app.use(Express.urlencoded());

		if(this._config.file.upload){
			this._app.use(fileUpload(
				this._config.file.upload.options
			));
		}

		this._registerRoutes();

		if(this._config.http.enabled){
			this._app.listen(this._config.http.port,()=>{
				console.log(
					`Express App running at http://127.0.0.1:`
					+`${this._config.http.port}/`
				);
			});
		}

		if(this._config.https.enabled){
			https.createServer(this._config.https.certificate)
				.listen(this._config.https.port,()=>{
					console.log(
						`Express App running at https://127.0.0.1:`
						+`${this._config.https.port}/`
					);
				});
		}
	}

	protected static _next(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:()=>void
	):void{
		return next();
	}

	protected _registerRoutes():void{
		const jsonRoute = this._config.route.json;
		if(jsonRoute?.enabled === true){
			this._app.all(
				'/json',
				jsonRoute.authenticate ?? PetQueryServer._next,
				this._mergeRequestParams.bind(this),
				this._handleJson.bind(this)
			);
		}

		const apiRoute = this._config.route.api;
		if(apiRoute?.enabled === true && apiRoute.module){
			this._app.all(
				'/api',
				apiRoute.authenticate ?? PetQueryServer._next,
				this._mergeRequestParams.bind(this),
				this._handleApi.bind(this)
			);
		}

		if(this._config.route['/']?.enabled === true){
			this._app.all(
				'/',
				this._mergeRequestParams.bind(this),
				this._redirectPetQueryOrg.bind(this),
				this._handleHtml.bind(this)
			);
		}
	}

	protected _mergeRequestParams(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:()=>void
	):void{
		const query = {
			...req.query,
			...req.body
		};
		const files = []
		
		for(const key of Object.keys(req.files || {})){
			const file = req.files?.[key];
			let fileArray:fileUpload.UploadedFile[];
			if(PetQueryTypes.isArray(file)){
				PetQueryAssert.assertArray(file);
				fileArray = file;
			}else{
				fileArray = [file as UploadedFile];
			}
			for(const value of fileArray){
				files.push(new PetQueryPluginQueryFile({
					filename:value.name,
					mime:value.mimetype,
					data:value.data.toString('base64'),
					size:value.size,
					md5:value.md5
				}));
			}
		}
		req.petQueryPluginQuery = req.petQueryPluginQuery ?? new PetQueryPluginQuery({
			 query:(PetQueryTypes.isString(query.query) ? query.query : '')
			,bearer:(PetQueryTypes.isString(query.bearer) ? query.bearer : '')
			,files:files
			,iframe:(PetQueryTypes.isBoolean(query.iframe) ? query.iframe : false)
		});

		next();
	}

	protected _redirectPetQueryOrg(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:()=>void
	):void{
		const bearer = req.petQueryPluginQuery?.getBearer() ?? '';
		if(String(req.headers?.host).match(/petquery\.org/)
		&& !this._config.authenticate.bearer.has(bearer)){
			res.redirect(307,
				'https://github.com/ykat-UG-haftungsbeschrankt/petquery'
			);
			return;
		}
		next();
	}

	protected async _handleJson(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			res.json(await this._queryAll(req.petQueryPluginQuery));
		}catch(error){
			res.status(500).send(util.inspect(error));
		}
	}

	protected async _handleApi(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		try{
			const pluginName = this._config.route.api.module;
			const plugin = this._plugins.get(pluginName);
			if(plugin === undefined){
				throw new Error(`Plugin "${pluginName}" is not registered`);
			}
			if(req.petQueryPluginQuery !== undefined){
				res.json(await plugin.query(req.petQueryPluginQuery));
			}else{
				res.json([]);
			}
		}catch(error){
			res.status(500).send(util.inspect(error));
		}
	}

	protected async _queryAll(
		query:PetQueryPluginQuery|undefined
	):Promise<PetQueryResult>{
		const result:PetQueryResult = {
			error:[],
			data:[]
		};

		if(query !== undefined){
			const promises = [];
			for(const plugin of this._plugins.values()){
				promises.push(plugin.query(query));
			}
			const settled = await Promise.allSettled(promises);

			for(const item of settled){
				if('rejected' === item.status){
					result.error.push(item.reason);
					continue;
				}

				result.data.push(
					...item.value.slice(
						0,
						this._config.max_results_per_module
					)
				);
			}

			result.data = result.data.slice(
				0,
				this._config.max_results_total
			);
		}

		return result;
	}

	protected async _handleHtml(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		const query = req.petQueryPluginQuery;
		const result = await this._queryAll(query);
		const errors = result.error.map(
			(error)=>`<pre>${PetQueryLib.escapeHtml(
				util.inspect(error)
			)}</pre>`
		).join('');
		const rows = result.data.map(
			(item)=>this._renderResult(item)
		).join('');
		const header = query?.isIframe() ? '' : `
			<h1>Pet Query</h1>
			<form method=post>
				<input type="text" name="query"
					placeholder="Enter identification number" required/>
				<input type="submit" value="Search">
				<br><br>
				<div class=example_id>
					Example identification number: 112093400000465
				</div>
			</form>
		`;

		res.end(`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Pet Query</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
		body{font-family:Helvetica,Arial,sans-serif}
		a{text-decoration:none}
		h1,form{text-align:center}
		.results .preview{max-width:150px;max-height:150px;float:left}
		.results .result{min-height:160px;border:1px solid #d2d2d2;
			background:#f9f9f9;border-radius:7px;margin-bottom:14px}
		.results .data{margin-top:7px}
		.results .data th{text-align:left;white-space:nowrap;
			vertical-align:top}
		.results .source{float:right;background:white;
			border-bottom:1px solid #d2d2d2;padding:1px 3px}
		.errors pre,.results pre{padding:3px 7px}
		.results .files{margin-left:160px}
		.example_id{color:#666;font-size:.7em}
		@media only screen and (max-width:768px){
			.results .data th,.results .data td{display:block}
			.results .data td{padding-left:21px}
			.results .files{margin-left:21px}
		}
	</style>
</head>
<body>
	<div class=header>${header}</div>
	<div class=body>
		${errors ? `<hr><h2>Errors:</h2><div>${errors}</div>` : ''}
		${rows ? `<hr><h2>Results:</h2><div>${rows}</div>` : ''}
	</div>
</body>
</html>`);
	}

	protected _renderResult(item:PetQueryPluginResult):string{
		const source = item.getSource();
		const data = PetQueryLib.objectMap(
			item.getAttributes() || {},
			(key:string,value:unknown)=>(
				`<tr><th>${PetQueryLib.escapeHtml(key)}</th><td>`
				+this._renderValue(value)
				+'</td></tr>'
			)
		).join('');
		const preview = item.hasPreview()
			? `<img src="${
				PetQueryLib.escapeHtmlAttribute(item.getPreview())
			}" class=preview>`
			: '';
		const favicon = source.hasFavicon()
			? `<img src="${
				PetQueryLib.escapeHtmlAttribute(source.getFavicon())
			}" class=favicon> `
			: '';
		const href = source.hasUrl()
			? `href="${PetQueryLib.escapeHtmlAttribute(source.getUrl())}"`
			: '';
		const files = item.getFiles().map(
			(file:string)=>`<li><a href="${
				PetQueryLib.escapeHtmlAttribute(file)
			}" target=_blank>${PetQueryLib.escapeHtml(file)}</a></li>`
		).join('');

		return `<div class=result>${preview}<a ${href} target=_blank
			class=source>${favicon}${
				PetQueryLib.escapeHtml(source.getName())
			}</a><table class=data>${data}</table>${
				files ? `<div class=files><ul>${files}</ul></div>` : ''
			}</div>`;
	}

	protected _renderValue(value:unknown):string{
		if(PetQueryTypes.isArray(value)
		|| PetQueryTypes.isObject(value)){
			return `<pre>${PetQueryLib.escapeHtml(
				JSON.stringify(value,null,4)
			)}</pre>`;
		}
		return PetQueryLib.escapeHtml(String(value));
	}
}
