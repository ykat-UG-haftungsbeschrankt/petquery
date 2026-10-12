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
import type {PetQueryServerIndex} from '#petquery/server/index.js';
import type {PetQueryServerConfig} from '#petquery/server/config.js';
import type {PetQueryServerAuth} from '#petquery/server/auth.js';
import type {PetQueryServerPetStore} from
	'#petquery/server/pet/store.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export class PetQueryServer{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _app:Express.Express;
	protected readonly _plugins:Map<string,PetQueryPlugin>;
	protected readonly _uuid:uuid_t;
	// Borrowed; its owner must call its destructor.
	protected readonly _serverIndex:PetQueryServerIndex;
	// Borrowed; its owner must call its destructor.
	protected readonly _configFile:PetQueryServerConfig;
	// Borrowed; its owner must call its destructor.
	protected readonly _auth:PetQueryServerAuth;
	// Borrowed; its owner must call its destructor.
	protected readonly _petStore:PetQueryServerPetStore;
	protected _destructorPromise:Promise<void>|null;
	protected _httpServer:HttpServer|null;
	protected _httpsServer:HttpServer|null;

	// uuid is this server's persistent identity, answered by /api/ping/get.
	// configFile stores the values editable in the admin GUI.
	constructor(
		config:PetQueryConfigServerType,
		serverIndex:PetQueryServerIndex,
		uuid:uuid_t,
		configFile:PetQueryServerConfig,
		auth:PetQueryServerAuth,
		petStore:PetQueryServerPetStore
	){
		const upload = config.file.upload;

		this._config = config;
		this._serverIndex = serverIndex;
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
		this._destructorPromise = null;
		this._httpServer = null;
		this._httpsServer = null;
	}
	getConfig():PetQueryConfigServerType{
		return this._config;
	}

	addPlugin(plugin:PetQueryPlugin):void{
		if(null !== this._destructorPromise){
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

	destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
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
		if(null !== this._destructorPromise){
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

	_getServerIndex():PetQueryServerIndex{
		return this._serverIndex;
	}

	_getConfigFile():PetQueryServerConfig{
		return this._configFile;
	}

	_getAuth():PetQueryServerAuth{
		return this._auth;
	}

	_getPetStore():PetQueryServerPetStore{
		return this._petStore;
	}

	_getPlugin(name:string):PetQueryPlugin|undefined{
		return this._plugins.get(name);
	}

	async _authenticateUser(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await this._auth.authenticate(req);
		if(null === user){
			this._sendAuthError(res,401,'Authentication required');
			return;
		}
		req.petQueryUser = user;
		next();
	}

	async _authenticateAdmin(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:Express.NextFunction
	):Promise<void>{
		const user = await this._auth.authenticate(req);
		if(null === user){
			this._sendAuthError(res,401,'Authentication required');
			return;
		}
		if('admin' !== user.group){
			this._sendAuthError(res,403,'Admin access required');
			return;
		}
		req.petQueryUser = user;
		next();
	}

	protected async _destroy():Promise<void>{
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

	protected _sendAuthError(
		res:PetQueryServerResponse,
		status:uint16_t,
		message:utf8_t
	):void{
		res.set('Cache-Control','no-store');
		res.status(status).json({
			success:false,
			error:[message],
			data:null
		});
	}

	registerRoutes(routes:PetQueryServerRoute[]):void{
		for(const route of routes){
			route.register(this._app);
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
