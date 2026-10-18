/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {PetQueryPlugin, PetQueryPluginConfig} from '#petquery/plugin.js';
import {PetQuerySchemaPluginRequestType} from '#schema/plugin/request.js';
import {PetQuerySchemaPluginResponseType} from '#schema/plugin/response.js';

export class PetQuery3pPluginAnimalidPlugin extends PetQueryPlugin{
	constructor(cfg:ConstructorParameters<typeof PetQueryPluginConfig>[0]){
		super('animalid.by',cfg);
	}
	override async query(query:PetQuerySchemaPluginRequestType):Promise<PetQuerySchemaPluginResponseType>{
		const queryId = query.query.replace(/[^0-9]/g,'');
		if(queryId === ''){
			return [];
		}

		const ret = [];
		const data = await fetch("https://animalid.by/", {
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded"
			},
			"referrer": "https://animalid.by/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": "id="+queryId,
			"method": "POST",
			"mode": "cors",
			signal: AbortSignal.timeout(this.getTimeout())
		});
		const body = await data.text();

		if(body.match(/Чип должен состоять из 15 цифр!/g) === null
		&& body.match(/Чип \d+ не найден!/g) === null){
			const img = body.match(/<td\s+id="img">[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>/);
			const table = [...body.matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td[^>]*>[\s\S]*?<\/tr[^>]*>/g)];
			const obj:json_object_t = {};
			let preview = '';
			let files:uri_t[] = [];

			if(img){
					preview = 'https://animalid.by'+img[1];
					files = ['https://animalid.by'+img[1]];
			}

			for(const row of table){
				obj[row[1].replace(/<[^>]+(>|$)/g, "")] = row[2].replace(/<[^>]+(>|$)/g, "");
			}

			ret.push({
				 petId:''
				,source:this.getSource()
				,preview:preview
				,files:files
				,attributes:obj
			});
		}

		return ret;
	}
};
