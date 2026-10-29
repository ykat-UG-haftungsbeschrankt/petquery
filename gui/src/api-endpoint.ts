/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { Translate } from '#gui/i18n';

export function _parseApiOrigin(
	value:utf8_t,
	t:Translate
):utf8_t{
	const input = value.trim();
	const url = URL.canParse(input) ? new URL(input) : null;
	if(null === url
	|| ('http:' !== url.protocol && 'https:' !== url.protocol)
	|| '/' !== url.pathname
	|| '' !== url.search
	|| '' !== url.hash
	|| '' !== url.username
	|| '' !== url.password){
		throw new Error(t('Enter a valid HTTP(S) API origin.'));
	}
	return url.origin;
}

export async function _saveApiEndpoint(
	value:utf8_t,
	t:Translate
):Promise<void>{
	const endpoint = _parseApiOrigin(value,t);
	const requestUrl = new URL(
		'/__petquery/api-endpoint',
		window.location.origin
	);
	requestUrl.searchParams.set('endpoint',endpoint);
	const response = await fetch(requestUrl,{method:'POST'});
	const message = await response.text();
	if(!response.ok){
		throw new Error('' === message
			? t('Unable to save the API endpoint.')
			: message);
	}
	if('saved' !== message){
		throw new Error(t('Unexpected API endpoint response.'));
	}
}
