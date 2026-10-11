/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {default as Express} from 'express';
import util from 'node:util';
import {PetQueryLib} from '#petquery/lib.js';
import type {PetQueryPluginResultEntry} from '#petquery/plugin/result/entry.js';
import {PetQueryTypes} from '#petquery/types.js';
import {PetQueryServerRoute} from '#petquery/server/route.js';
import {PetQueryServerCallbackMergeRequestParams} from
	'#petquery/server/callback/merge/request/params.js';
import {PetQueryServerCallbackRedirectPetqueryOrg} from
	'#petquery/server/callback/redirect/petquery/org.js';
import type {
	PetQueryServerRequest,
	PetQueryServerResponse
} from '#petquery/server/types.js';

export class PetQueryServerRouteHtml extends PetQueryServerRoute{
	register(app:Express.Express):void{
		if(true !== this._server._getConfig().route['/'].enabled){
			return;
		}

		const mergeRequestParams =
			new PetQueryServerCallbackMergeRequestParams(this._server);
		const redirectPetqueryOrg =
			new PetQueryServerCallbackRedirectPetqueryOrg(this._server);
		app.all(
			'/',
			mergeRequestParams.handle.bind(mergeRequestParams),
			redirectPetqueryOrg.handle.bind(redirectPetqueryOrg),
			this._handle.bind(this)
		);
	}

	protected async _handle(
		req:PetQueryServerRequest,
		res:PetQueryServerResponse
	):Promise<void>{
		if(undefined === req.petQueryPluginQuery){
			throw new Error(`req.petQueryPluginQuery is undefined`);
		}

		const query = req.petQueryPluginQuery;
		const result = await this._server._queryAll(query);
		const errors = result.getError().map(
			(error)=>`<pre>${PetQueryLib.escapeHtml(
				util.inspect(error)
			)}</pre>`
		).join('');
		const rows = result.getData().getData().map(
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

	protected _renderResult(item:PetQueryPluginResultEntry):string{
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
};
