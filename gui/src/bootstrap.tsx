/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { Panel } from '#gui/panel';
import { _parseApiOrigin } from '#gui/api-endpoint';
import { _saveApiEndpoint } from '#gui/api-endpoint';
import { isJsonRecord } from '#gui/json';
import { useAction } from '#gui/action';
import { useI18n } from '#gui/i18n';
import { PetQueryLogLevel } from '#petquery/log/level.js';
import { useState } from 'react';

import type { PetQuerySchemaServerDatabaseConfigEntryType } from '#schema/server/database/config/entry.js';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';

const MAX_TIMER_MS = 2147483647;

type BootstrapDatabaseConfig =
	PetQuerySchemaServerDatabaseConfigEntryType['database'];

function getDefaultApiOrigin(
	config:PetQuerySchemaServerDatabaseConfigEntryType
):utf8_t|null{
	const useHttp = config.http.enabled || !config.https.enabled;
	const protocol = useHttp ? 'http:' : 'https:';
	const host = useHttp ? config.http.host : config.https.host;
	const port = useHttp ? config.http.port : config.https.port;
	const targetHost = '0.0.0.0' === host || '::' === host
		? '127.0.0.1'
		: host;
	const authority = targetHost.includes(':')
		&& !targetHost.startsWith('[')
		? `[${targetHost}]`
		: targetHost;
	const value = `${protocol}//${authority}:${port}`;
	return URL.canParse(value) ? new URL(value).origin : null;
}

function makeDefaultConfig(
	bootstrapPort:port_t
):PetQuerySchemaServerDatabaseConfigEntryType{
	const httpsPort = 65535 === bootstrapPort
		? bootstrapPort - 1
		: bootstrapPort + 1;
	return {
		gid:crypto.randomUUID(),
		api:{
			endpoint:`http://127.0.0.1:${bootstrapPort}`
		},
		adminContact:'admin@example.com',
		companyAddress:'Example Company',
		http:{
			host:'127.0.0.1',
			port:bootstrapPort,
			enabled:true,
			trusted_proxies:[]
		},
		https:{
			host:'127.0.0.1',
			port:httpsPort,
			enabled:false,
			certificate:{
				key:'',
				cert:''
			}
		},
		authenticate:{
			mode:'lmdb',
			providers:['lmdb'],
			plugin_options:{},
			session:{
				cookie_name:'petquery',
				max_age:28800000,
				secure:false
			},
			lmdb:{
				users_name:'users',
				sessions_name:'sessions'
			},
			ldap:{
				url:'',
				bind_dn:'',
				bind_password:'',
				base_dn:'',
				user_filter:'(uid={{username}})',
				admin_group:'admin'
			},
			oidc:{
				issuer:'',
				client_id:'',
				client_secret:'',
				redirect_uri:'',
				scopes:'openid profile email groups',
				admin_group:'admin'
			}
		},
		file:{
			upload:{
				enabled:true,
				max_file_size:10485760
			}
		},
		max_results_per_module:10,
		max_results_total:100,
		index:{
			sync:{
				enabled:true,
				interval:5000,
				timeout:1000,
				max_servers:100
			}
		},
		logging:{
			level:PetQueryLogLevel.Info,
			request:{
				enabled:true
			},
			file:{
				path:'../../var/debug/bootstrap/petquery.log',
				max_size:10485760,
				max_files:5
			}
		},
		database:{
			type:'lmdb',
			path:'../../var/debug/bootstrap/lmdb'
		},
		ai_search_path:'../../var/debug/bootstrap/ai-search.sqlite3',
		route:{
			api:{
				enabled:true,
				plugins:[]
			}
		}
	};
}

function parseLines(value:utf8_t):Array<utf8_t>{
	const result:Array<utf8_t> = [];
	for(const line of value.split('\n')){
		const entry = line.trim();
		if('' !== entry && !result.includes(entry)){
			result.push(entry);
		}
	}
	return result;
}

function textField(
	label:utf8_t,
	value:utf8_t,
	onChange:(value:utf8_t)=>void,
	type:'text'|'password'|'url' = 'text'
):ReactElement{
	return (
		<label className="field">
			<span>{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event)=>{
					onChange(event.target.value);
				}}
			/>
		</label>
	);
}

function textAreaField(
	label:utf8_t,
	value:utf8_t,
	onChange:(value:utf8_t)=>void,
	rows:uint_t = 3
):ReactElement{
	return (
		<label className="field">
			<span>{label}</span>
			<textarea
				rows={rows}
				value={value}
				onChange={(event)=>{
					onChange(event.target.value);
				}}
			/>
		</label>
	);
}

function numberField(
	label:utf8_t,
	value:uint_t,
	min:uint_t,
	max:uint_t,
	onChange:(value:uint_t)=>void
):ReactElement{
	return (
		<label className="field">
			<span>{label}</span>
			<input
				type="number"
				required
				step={1}
				min={min}
				max={max}
				value={Number.isNaN(value) ? '' : value}
				onChange={(event)=>{
					onChange(event.target.valueAsNumber);
				}}
			/>
		</label>
	);
}

function checkboxField(
	label:utf8_t,
	checked:bool_t,
	onChange:(checked:bool_t)=>void
):ReactElement{
	return (
		<label className="check">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event)=>{
					onChange(event.target.checked);
				}}
			/>
			{label}
		</label>
	);
}

export function Bootstrap(props:{
	bootstrapPort:port_t;
}):ReactElement{
	const {t} = useI18n();
	const {busy,error,run} = useAction();
	const [form,setForm] =
		useState<PetQuerySchemaServerDatabaseConfigEntryType>(
			()=>makeDefaultConfig(props.bootstrapPort)
		);
	const [pluginOptionsText,setPluginOptionsText] =
		useState<utf8_t>('{}');
	const [saved,setSaved] = useState<bool_t>(false);

	function edit(change:(
		draft:PetQuerySchemaServerDatabaseConfigEntryType
	)=>void):void{
		setForm((current)=>{
			const draft = structuredClone(current);
			change(draft);
			return draft;
		});
	}

	function editListener(change:(
		draft:PetQuerySchemaServerDatabaseConfigEntryType
	)=>void):void{
		setForm((current)=>{
			const previousOrigin = getDefaultApiOrigin(current);
			const draft = structuredClone(current);
			change(draft);
			const nextOrigin = getDefaultApiOrigin(draft);
			if(null !== previousOrigin
			&& current.api.endpoint === previousOrigin
			&& null !== nextOrigin){
				draft.api.endpoint = nextOrigin;
			}
			return draft;
		});
	}

	function setDatabaseType(value:utf8_t):void{
		let database:BootstrapDatabaseConfig;
		switch(value){
		case 'lmdb':
			database = {
				type:'lmdb',
				path:'../../var/debug/bootstrap/lmdb'
			};
			break;
		case 'mariadb':
			database = {
				type:'mariadb',
				connectionString:''
			};
			break;
		case 'mongodb':
			database = {
				type:'mongodb',
				connectionString:'',
				database:'petquery'
			};
			break;
		case 'postgresql':
			database = {
				type:'postgresql',
				connectionString:''
			};
			break;
		case 'redis':
			database = {
				type:'redis',
				connectionString:''
			};
			break;
		case 'sqlite':
			database = {
				type:'sqlite',
				path:'../../var/debug/bootstrap/petquery.sqlite3'
			};
			break;
		default:
			throw new Error('Unsupported database type');
		}
		edit((draft)=>{
			draft.database = database;
		});
	}

	function setDatabasePath(value:utf8_t):void{
		edit((draft)=>{
			switch(draft.database.type){
			case 'lmdb':
			case 'sqlite':
				draft.database.path = value;
				break;
			default:
				throw new Error('A database path is not selected');
			}
		});
	}

	function setDatabaseConnectionString(value:utf8_t):void{
		edit((draft)=>{
			switch(draft.database.type){
			case 'mariadb':
			case 'mongodb':
			case 'postgresql':
			case 'redis':
				draft.database.connectionString = value;
				break;
			default:
				throw new Error('A database connection is not selected');
			}
		});
	}

	function setMongodbDatabase(value:utf8_t):void{
		edit((draft)=>{
			if('mongodb' !== draft.database.type){
				throw new Error('MongoDB is not the selected database');
			}
			draft.database.database = value;
		});
	}

	function getDatabaseConnectionStringLabel():utf8_t{
		switch(form.database.type){
		case 'mariadb':
			return t('MariaDB connection string');
		case 'mongodb':
			return t('MongoDB connection string');
		case 'postgresql':
			return t('PostgreSQL connection string');
		case 'redis':
			return t('Redis connection string');
		default:
			throw new Error('A database connection is not selected');
		}
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		setSaved(false);
		run(async ()=>{
			if(!form.http.enabled && !form.https.enabled){
				throw new Error(t(
					'Enable HTTP or HTTPS so the server can accept API requests.'
				));
			}
			if(0 === form.authenticate.providers.length){
				throw new Error(t(
					'At least one authentication provider is required.'
				));
			}
			if(form.https.enabled
			&& ('' === form.https.certificate.key
			|| '' === form.https.certificate.cert)){
				throw new Error(t(
					'Provide a TLS key and certificate to enable HTTPS.'
				));
			}
			const apiEndpoint = _parseApiOrigin(form.api.endpoint,t);
			const rawPluginOptions:unknown = JSON.parse(pluginOptionsText);
			if(!isJsonRecord(rawPluginOptions)){
				throw new Error(t('Plugin options must be a JSON object'));
			}
			const config:PetQuerySchemaServerDatabaseConfigEntryType = {
				...form,
				api:{
					endpoint:apiEndpoint
				},
				authenticate:{
					...form.authenticate,
					plugin_options:rawPluginOptions
				}
			};
			const response = await fetch('/bootstrap',{
				method:'POST',
				headers:{'content-type':'application/json'},
				body:JSON.stringify(config)
			});
			const message = await response.text();
			if(!response.ok){
				throw new Error('' === message
					? t('Unable to save bootstrap configuration.')
					: message);
			}
			if('saved' !== message){
				throw new Error(t(
					'Unexpected response from the bootstrap server.'
				));
			}
			await _saveApiEndpoint(apiEndpoint,t);
			setSaved(true);
		});
	}

	return (
		<>
			<Panel className="login-card">
				<div className="eyebrow">{t('First-time setup')}</div>
				<h2>{t('Bootstrap server settings')}</h2>
				<p className="muted">
					{t(
						'The configuration will be saved to the selected '
						+'startup file.'
					)}
				</p>
				<p className="muted">
					{t(
						'The administrator account is created after the '
						+'server starts.'
					)}
				</p>
			</Panel>
			{null !== error && <p className="error" role="alert">{error}</p>}
			{saved && (
				<p className="muted" role="status">
					{t('Configuration saved. Starting the API server...')}
				</p>
			)}
			<form onSubmit={onSubmit}>
				<Panel>
					<h2>{t('Server identity')}</h2>
					{textField(
						t('Public API endpoint URI'),
						form.api.endpoint,
						(value)=>{
							edit((draft)=>{
								draft.api.endpoint = value;
							});
						},
						'url'
					)}
					{textField(
						t('Admin contact'),
						form.adminContact,
						(value)=>{
							edit((draft)=>{
								draft.adminContact = value;
							});
						}
					)}
					{textField(
						t('Company address'),
						form.companyAddress,
						(value)=>{
							edit((draft)=>{
								draft.companyAddress = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('HTTP')}</h2>
					{textField(
						t('HTTP host'),
						form.http.host,
						(value)=>{
							editListener((draft)=>{
								draft.http.host = value;
							});
						}
					)}
					{numberField(
						t('Port'),
						form.http.port,
						1,
						65535,
						(value)=>{
							editListener((draft)=>{
								draft.http.port = value;
							});
						}
					)}
					{checkboxField(
						t('Enabled'),
						form.http.enabled,
						(value)=>{
							editListener((draft)=>{
								draft.http.enabled = value;
							});
						}
					)}
					{textAreaField(
						t('Trusted proxy IPs/CIDRs'),
						form.http.trusted_proxies.join('\n'),
						(value)=>{
							edit((draft)=>{
								draft.http.trusted_proxies =
									parseLines(value);
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('HTTPS')}</h2>
					{textField(
						t('HTTPS host'),
						form.https.host,
						(value)=>{
							editListener((draft)=>{
								draft.https.host = value;
							});
						}
					)}
					{numberField(
						t('HTTPS port'),
						form.https.port,
						1,
						65535,
						(value)=>{
							editListener((draft)=>{
								draft.https.port = value;
							});
						}
					)}
					{checkboxField(
						t('Enabled'),
						form.https.enabled,
						(value)=>{
							editListener((draft)=>{
								draft.https.enabled = value;
							});
						}
					)}
					{textAreaField(
						t('TLS private key'),
						form.https.certificate.key,
						(value)=>{
							edit((draft)=>{
								draft.https.certificate.key = value;
							});
						},
						5
					)}
					{textAreaField(
						t('TLS certificate'),
						form.https.certificate.cert,
						(value)=>{
							edit((draft)=>{
								draft.https.certificate.cert = value;
							});
						},
						5
					)}
				</Panel>

				<Panel>
					<h2>{t('Database backend')}</h2>
					<label className="field">
						<span>{t('Database backend')}</span>
						<select
							value={form.database.type}
							onChange={(event)=>{
								setDatabaseType(event.target.value);
							}}
						>
							<option value="lmdb">{t('LMDB')}</option>
							<option value="mariadb">{t('MariaDB')}</option>
							<option value="mongodb">{t('MongoDB')}</option>
							<option value="postgresql">
								{t('PostgreSQL')}
							</option>
							<option value="redis">{t('Redis')}</option>
							<option value="sqlite">{t('SQLite')}</option>
						</select>
					</label>
					{'lmdb' === form.database.type
					|| 'sqlite' === form.database.type
						? textField(
							t(
								'lmdb' === form.database.type
									? 'LMDB data path'
									: 'SQLite data path'
							),
							form.database.path,
							setDatabasePath
						)
						: <>
							{textField(
								getDatabaseConnectionStringLabel(),
								form.database.connectionString,
								setDatabaseConnectionString,
								'password'
							)}
							{'mongodb' === form.database.type
								&& textField(
									t('MongoDB database name'),
									form.database.database,
									setMongodbDatabase
								)}
						</>}
					{textField(
						t('AI search database path'),
						form.ai_search_path,
						(value)=>{
							edit((draft)=>{
								draft.ai_search_path = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('Authentication')}</h2>
					{textField(
						t('Authentication mode'),
						form.authenticate.mode,
						(value)=>{
							edit((draft)=>{
								draft.authenticate.mode = value;
							});
						}
					)}
					{textAreaField(
						t('Enabled providers'),
						form.authenticate.providers.join('\n'),
						(value)=>{
							edit((draft)=>{
								draft.authenticate.providers =
									parseLines(value);
							});
						}
					)}
					{textAreaField(
						t('Provider options (JSON)'),
						pluginOptionsText,
						setPluginOptionsText,
						6
					)}
					{checkboxField(
						t('Secure session cookie'),
						form.authenticate.session.secure,
						(value)=>{
							edit((draft)=>{
								draft.authenticate.session.secure = value;
							});
						}
					)}
					{textField(
						t('Session cookie name'),
						form.authenticate.session.cookie_name,
						(value)=>{
							edit((draft)=>{
								draft.authenticate.session.cookie_name =
									value;
							});
						}
					)}
					{numberField(
						t('Session lifetime (ms)'),
						form.authenticate.session.max_age,
						60000,
						2147483647,
						(value)=>{
							edit((draft)=>{
								draft.authenticate.session.max_age = value;
							});
						}
					)}
					<details>
						<summary>{t('LMDB authentication')}</summary>
						{textField(
							t('Users database'),
							form.authenticate.lmdb.users_name,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.lmdb.users_name =
										value;
								});
							}
						)}
						{textField(
							t('Sessions database'),
							form.authenticate.lmdb.sessions_name,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.lmdb.sessions_name =
										value;
								});
							}
						)}
					</details>
					<details>
						<summary>{t('LDAP settings')}</summary>
						{textField(
							t('LDAP URL'),
							form.authenticate.ldap.url,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.url = value;
								});
							}
						)}
						{textField(
							t('Bind DN'),
							form.authenticate.ldap.bind_dn,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.bind_dn = value;
								});
							}
						)}
						{textField(
							t('Bind password'),
							form.authenticate.ldap.bind_password,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.bind_password =
										value;
								});
							},
							'password'
						)}
						{textField(
							t('User base DN'),
							form.authenticate.ldap.base_dn,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.base_dn = value;
								});
							}
						)}
						{textField(
							t('User filter'),
							form.authenticate.ldap.user_filter,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.user_filter =
										value;
								});
							}
						)}
						{textField(
							t('Admin group'),
							form.authenticate.ldap.admin_group,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.ldap.admin_group =
										value;
								});
							}
						)}
					</details>
					<details>
						<summary>{t('OpenID Connect settings')}</summary>
						{textField(
							t('Issuer'),
							form.authenticate.oidc.issuer,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.issuer = value;
								});
							}
						)}
						{textField(
							t('Client ID'),
							form.authenticate.oidc.client_id,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.client_id = value;
								});
							}
						)}
						{textField(
							t('Client secret'),
							form.authenticate.oidc.client_secret,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.client_secret =
										value;
								});
							},
							'password'
						)}
						{textField(
							t('Redirect URI'),
							form.authenticate.oidc.redirect_uri,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.redirect_uri =
										value;
								});
							}
						)}
						{textField(
							t('Scopes'),
							form.authenticate.oidc.scopes,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.scopes = value;
								});
							}
						)}
						{textField(
							t('Admin group'),
							form.authenticate.oidc.admin_group,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.oidc.admin_group =
										value;
								});
							}
						)}
					</details>
				</Panel>

				<Panel>
					<h2>{t('Logging')}</h2>
					<label className="field">
						<span>{t('Log level')}</span>
						<select
							value={form.logging.level}
							onChange={(event)=>{
								const value = event.target.value;
								if(PetQueryLogLevel.Error === value
								|| PetQueryLogLevel.Warn === value
								|| PetQueryLogLevel.Info === value
								|| PetQueryLogLevel.Debug === value){
									edit((draft)=>{
										draft.logging.level = value;
									});
								}
							}}
						>
							<option value={PetQueryLogLevel.Error}>
								{t('error')}
							</option>
							<option value={PetQueryLogLevel.Warn}>
								{t('warn')}
							</option>
							<option value={PetQueryLogLevel.Info}>
								{t('info')}
							</option>
							<option value={PetQueryLogLevel.Debug}>
								{t('debug')}
							</option>
						</select>
					</label>
					{checkboxField(
						t('Request logging'),
						form.logging.request.enabled,
						(value)=>{
							edit((draft)=>{
								draft.logging.request.enabled = value;
							});
						}
					)}
					{textField(
						t('Log file path'),
						form.logging.file.path,
						(value)=>{
							edit((draft)=>{
								draft.logging.file.path = value;
							});
						}
					)}
					{numberField(
						t('Log file max size (bytes)'),
						form.logging.file.max_size,
						1024,
						10485760,
						(value)=>{
							edit((draft)=>{
								draft.logging.file.max_size = value;
							});
						}
					)}
					{numberField(
						t('Max log files'),
						form.logging.file.max_files,
						2,
						5,
						(value)=>{
							edit((draft)=>{
								draft.logging.file.max_files = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('File upload')}</h2>
					{checkboxField(
						t('Enabled'),
						form.file.upload.enabled,
						(value)=>{
							edit((draft)=>{
								draft.file.upload.enabled = value;
							});
						}
					)}
					{numberField(
						t('Max file size (bytes)'),
						form.file.upload.max_file_size,
						1,
						1073741824,
						(value)=>{
							edit((draft)=>{
								draft.file.upload.max_file_size = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('Results')}</h2>
					{numberField(
						t('Max results per plugin'),
						form.max_results_per_module,
						1,
						1000000,
						(value)=>{
							edit((draft)=>{
								draft.max_results_per_module = value;
							});
						}
					)}
					{numberField(
						t('Max results in total'),
						form.max_results_total,
						1,
						1000000,
						(value)=>{
							edit((draft)=>{
								draft.max_results_total = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('Peer sync')}</h2>
					{checkboxField(
						t('Enabled'),
						form.index.sync.enabled,
						(value)=>{
							edit((draft)=>{
								draft.index.sync.enabled = value;
							});
						}
					)}
					{numberField(
						t('Interval (ms)'),
						form.index.sync.interval,
						1000,
						MAX_TIMER_MS,
						(value)=>{
							edit((draft)=>{
								draft.index.sync.interval = value;
							});
						}
					)}
					{numberField(
						t('Request timeout (ms)'),
						form.index.sync.timeout,
						100,
						MAX_TIMER_MS,
						(value)=>{
							edit((draft)=>{
								draft.index.sync.timeout = value;
							});
						}
					)}
					{numberField(
						t('Max servers read per peer'),
						form.index.sync.max_servers,
						1,
						1000000,
						(value)=>{
							edit((draft)=>{
								draft.index.sync.max_servers = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('Routes')}</h2>
					{checkboxField(
						t('/api (includes this page\'s API)'),
						form.route.api.enabled,
						(value)=>{
							edit((draft)=>{
								draft.route.api.enabled = value;
							});
						}
					)}
					{textAreaField(
						t('Plugins queried by /api'),
						form.route.api.plugins.join('\n'),
						(value)=>{
							edit((draft)=>{
								draft.route.api.plugins = parseLines(value);
							});
						}
					)}
				</Panel>

				<Framework7Button type="submit" disabled={busy} fill>
					{busy
						? t('Saving bootstrap configuration...')
						: t('Save and start server')}
				</Framework7Button>
			</form>
		</>
	);
}
