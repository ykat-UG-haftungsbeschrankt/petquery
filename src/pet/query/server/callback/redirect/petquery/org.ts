/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {PetQueryServer} from '#petquery/server.js';
import type {
	PetQueryServerNext,
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export class PetQueryServerCallbackRedirectPetqueryOrg{
	protected readonly _server:PetQueryServer;

	constructor(server:PetQueryServer){
		this._server = server;
	}

	handle(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse,
		next:PetQueryServerNext
	):void{
		const bearer = req.petQueryPluginQuery?.getBearer() ?? '';
		if(String(req.headers?.host).match(/petquery\.org/)
		&& !this._server._getConfig().authenticate.bearer.has(bearer)){
			res.redirect(307,
				'https://github.com/ykat-UG-haftungsbeschrankt/petquery'
			);
			return;
		}
		next();
	}
};
