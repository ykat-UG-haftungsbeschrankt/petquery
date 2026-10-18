/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {Client as LdapClient} from 'ldapts';
import type {PetQueryConfigServerType} from '#petquery/config.js';
import type {PetQueryDatabase} from '#petquery/database.js';
import type {PetQueryServerAuthUser} from '#petquery/server/auth.js';
import {PetQueryServerAuthPlugin} from '#petquery/server/auth/plugin.js';
import type {PetQueryServerRequest} from '#petquery/server/request.js';

export class PetQueryServerAuthPluginLdap extends PetQueryServerAuthPlugin{
	protected readonly _config:PetQueryConfigServerType;
	protected readonly _clients:Set<LdapClient>;
	protected _destructorPromise:Promise<void>|null;

	constructor(
		config:PetQueryConfigServerType,
		UNUSED_database:PetQueryDatabase
	){
		super();
		this._config = config;
		this._clients = new Set();
		this._destructorPromise = null;
	}

	override destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destroyed = true;
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
		try{
			await super.destructor();
			for(const client of this._clients){
				this._clients.delete(client);
				await client.unbind();
			}
		}
		catch(UNUSED_e){
		}
	}

	getName():utf8_t{
		return 'ldap';
	}

	getLoginType():'bearer'|'password'|'redirect'{
		return 'password';
	}

	async login(req:PetQueryServerRequest):Promise<PetQueryServerAuthUser>{
		this._assertNotDestroyed();
		const body = this._getPasswordLogin(req);
		const config = this._config.authenticate.ldap;
		if('' === config.url || '' === config.base_dn){
			throw new Error('LDAP authentication is not configured');
		}
		const client = new LdapClient({
			url:config.url,
			timeout:10000,
			connectTimeout:10000
		});
		this._clients.add(client);
		let user:PetQueryServerAuthUser;
		try{
			if('' !== config.bind_dn){
				await client.bind(config.bind_dn,config.bind_password);
				this._assertNotDestroyed();
			}
			const result = await client.search(config.base_dn,{
				scope:'sub',
				filter:this._getLdapFilter(
					config.user_filter,
					body.username
				),
				sizeLimit:2,
				attributes:[
					'cn',
					'displayName',
					'mail',
					'memberOf',
					'groups'
				]
			});
			this._assertNotDestroyed();
			if(1 !== result.searchEntries.length){
				throw new Error('Invalid username or password');
			}
			const entry = result.searchEntries[0];
			await client.bind(entry.dn,body.password);
			this._assertNotDestroyed();
			user = this._getLdapUser(body.username,entry);
		}
		finally{
			if(this._clients.delete(client)){
				await client.unbind();
			}
		}
		this._assertNotDestroyed();
		return user;
	}

	protected _getLdapFilter(template:utf8_t,username:utf8_t):utf8_t{
		const value = this._escapeLdapFilterValue(username);
		const filter = '' === template ? '(uid={{username}})' : template;
		return filter.split('{{username}}').join(value);
	}

	protected _escapeLdapFilterValue(value:utf8_t):utf8_t{
		let escaped = value.replaceAll('\\','\\5c');
		escaped = escaped.replaceAll('*','\\2a');
		escaped = escaped.replaceAll('(','\\28');
		escaped = escaped.replaceAll(')','\\29');
		return escaped.replaceAll('\u0000','\\00');
	}

	protected _getLdapUser(
		username:utf8_t,
		entry:Record<utf8_t,Buffer|Buffer[]|utf8_t[]|utf8_t>
	):PetQueryServerAuthUser{
		const displayName = this._getFirstString(
			entry.displayName,
			this._getFirstString(entry.cn,username)
		);
		return {
			username,
			displayName,
			group:this._hasAdminGroup(entry) ? 'admin' : 'user',
			provider:this.getName()
		};
	}

	protected _hasAdminGroup(
		entry:Record<utf8_t,Buffer|Buffer[]|utf8_t[]|utf8_t>
	):bool_t{
		const adminGroup = this._config.authenticate.ldap.admin_group;
		if('' === adminGroup){
			return false;
		}
		const values = [
			...this._getStringArray(entry.memberOf),
			...this._getStringArray(entry.groups)
		];
		for(const value of values){
			if(adminGroup === value
			|| value.toLowerCase().includes(
				`cn=${adminGroup.toLowerCase()},`
			)){
				return true;
			}
		}
		return false;
	}
};
