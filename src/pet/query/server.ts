/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {default as Express} from 'express';
import fileUpload from 'express-fileupload';
import https from 'node:https';
import type {Server as HttpServer} from 'node:http';
import {PetQueryPlugin} from '#petquery/plugin.js';
import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryServerRoute} from '#petquery/server/route.js';
import type {PetQueryServerHandler} from
	'#petquery/server/route.js';
import type {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerAuth} from '#petquery/server/auth.js';
import type {PetQueryDatabase} from '#petquery/database.js';
import {PetQueryServerRequest} from
	'#petquery/server/request.js';
import {PetQueryServerResponse} from
	'#petquery/server/response.js';
import { PetQueryDestructor } from './destructor.js';

export class PetQueryServer extends PetQueryDestructor{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _app:Express.Express;
	protected readonly _plugins:Map<string,PetQueryPlugin>;
	protected readonly _uuid:uuid_t;
	// Borrowed; its owner must call its destructor.
	// Borrowed; its owner must call its destructor.
	protected readonly _database:PetQueryDatabase;
	// Borrowed; its owner must call its destructor.
	protected readonly _configFile:PetQueryServerConfig;
	// Borrowed; its owner must call its destructor.
	protected readonly _auth:PetQueryServerAuth;
	// Borrowed; its owner must call its destructor.
	protected readonly _petStore:PetQueryDatabase;
	protected _httpServer:HttpServer|null;
	protected _httpsServer:HttpServer|null;

	// uuid is this server's persistent identity, answered by /api/ping/get.
	// configFile stores the values editable in the admin GUI.
	constructor(
		config:PetQueryConfigServerType,
		database:PetQueryDatabase,
		uuid:uuid_t,
		configFile:PetQueryServerConfig,
		auth:PetQueryServerAuth,
		petStore:PetQueryDatabase
	){
		super();
		const upload = config.file.upload;

		this._config = config;
		this._database = database;
		this._configFile = configFile;
		this._auth = auth;
		this._petStore = petStore;
		this._app = Express();
		this._app.use(Express.json());
		this._app.use(Express.urlencoded());
		if(upload.enabled){
			this._app.use(fileUpload({
				...upload.options,
				limits:{
					...upload.options.limits,
					fileSize:upload.max_file_size
				}
			}));
		}
		this._plugins = new Map();
		this._uuid = uuid;
		this._httpServer = null;
		this._httpsServer = null;
	}
	async _destructor():Promise<void>{
		const servers = [
			this._httpServer,
			this._httpsServer
		];
		this._httpServer = null;
		this._httpsServer = null;
		await Promise.allSettled(
			servers
				.filter((server):server is HttpServer => null !== server)
				.map((server)=>this._closeServer(server))
		);
		const plugins = Array.from(this._plugins.values());
		this._plugins.clear();
		await Promise.allSettled(
			plugins.map((plugin)=>plugin.destructor())
		);
	}

	addPlugin(plugin:PetQueryPlugin):void{
		if(this._isDestroyed()){
			throw new Error('Server is destroyed');
		}
		if(!plugin.isEnabled()){
			return;
		}
		if(this._plugins.has(plugin.getName())){
			throw new Error(
				`Plugin "${plugin.getName()}" is already registered`
			);
		}
		this._plugins.set(plugin.getName(),plugin);
	}
	getPlugins(pluginFilter:Set<string>|null):Iterable<PetQueryPlugin>{
		const ret = [];
		
		if(pluginFilter === null){
			return this._plugins.values();
		}
		
		for(const name of pluginFilter){
			const plugin = this._plugins.get(name);
			if(plugin !== undefined){
				ret.push(plugin);
			}
		}

		return ret;
	}

	start():void{
		if(this._isDestroyed()){
			throw new Error('Server is destroyed');
		}
		if(null !== this._httpServer || null !== this._httpsServer){
			throw new Error('Server is already started');
		}
		if(this._config.http.enabled){
			this._httpServer = this._app.listen(
				this._config.http.port,
				this._onHttpListening.bind(this)
			);
		}

		if(this._config.https.enabled){
			this._httpsServer = https.createServer(
				this._config.https.certificate
			)
				.listen(
					this._config.https.port,
					this._onHttpsListening.bind(this)
				);
		}
	}

	_getConfig():PetQueryConfigServerType{
		return this._config;
	}

	_getUuid():uuid_t{
		return this._uuid;
	}

	_getDatabase():PetQueryDatabase{
		return this._database;
	}

	_getConfigFile():PetQueryServerConfig{
		return this._configFile;
	}

	getAuth():PetQueryServerAuth{
		return this._auth;
	}

	_getPlugin(name:string):PetQueryPlugin|undefined{
		return this._plugins.get(name);
	}

	protected _closeServer(server:HttpServer):Promise<void>{
		return new Promise((resolve,reject)=>{
			server.close((error)=>{
				if(undefined === error){
					resolve();
				}else{
					reject(error);
				}
			});
		});
	}

	all(
		path:string|string[],
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.all(path,...this._wrapHandlers(handlers));
	}

	delete(
		path:string|string[],
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.delete(path,...this._wrapHandlers(handlers));
	}

	get(
		path:string|string[],
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.get(path,...this._wrapHandlers(handlers));
	}

	post(
		path:string|string[],
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.post(path,...this._wrapHandlers(handlers));
	}

	put(
		path:string|string[],
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.put(path,...this._wrapHandlers(handlers));
	}

	use(
		path:string,
		...handlers:PetQueryServerHandler[]
	):void{
		this._app.use(path,...this._wrapHandlers(handlers));
	}

	useExpress(
		path:string,
		...handlers:Express.RequestHandler[]
	):void{
		this._app.use(path,...handlers);
	}

	protected _wrapHandlers(
		handlers:Array<PetQueryServerHandler>
	):Array<Express.RequestHandler>{
		return handlers.map((handler)=>{
			return (
				request:Express.Request,
				response:Express.Response,
				next:Express.NextFunction
			)=>{
				return handler(
					new PetQueryServerRequest(request),
					new PetQueryServerResponse(response),
					next
				);
			};
		});
	}

	registerRoutes(routes:PetQueryServerRoute[]):void{
		for(const route of routes){
			route.register();
		}
	}

	protected _onHttpListening():void{
		console.log(
			`Express App running at http://127.0.0.1:`
			+`${this._config.http.port}/`
		);
	}

	protected _onHttpsListening():void{
		console.log(
			`Express App running at https://127.0.0.1:`
			+`${this._config.https.port}/`
		);
	}
};
