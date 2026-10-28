/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { isIP } from 'node:net';

export class PetQueryIp implements Singleton{
	private constructor(){}

	static validateTrustedProxies(
		values:Array<ip_t | cidr_t>
	):Array<ip_t | cidr_t>{
		const proxies:Array<ip_t | cidr_t> = [];
		for(const value of values){
			const proxy = value.trim();
			const valid = proxy.includes('/')
				? this.isValidCidr(proxy)
				: this.isValidIp(proxy);
			if(!valid){
				throw new Error(
					'Trusted proxies must be IPv4/IPv6 addresses or CIDRs'
				);
			}
			if(!proxies.includes(proxy)){
				proxies.push(proxy);
			}
		}
		return proxies;
	}

	static isValidIp(value:ip_t):bool_t{
		return 0 !== isIP(value);
	}

	static isValidCidr(value:cidr_t):bool_t{
		const parts = value.split('/');
		if(2 !== parts.length){
			return false;
		}
		const address = parts[0];
		const prefix = parts[1];
		if(undefined === address || undefined === prefix){
			return false;
		}
		const version = isIP(address);
		if(0 === version || !/^\d+$/.test(prefix)){
			return false;
		}
		const prefixLength = Number(prefix);
		const maxPrefixLength = 4 === version ? 32 : 128;
		if(!Number.isInteger(prefixLength)
		|| 0 > prefixLength
		|| prefixLength > maxPrefixLength){
			return false;
		}
		return true;
	}
};
