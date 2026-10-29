/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { getConfig } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { saveConfig } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useI18n } from '#gui/i18n';
import { useState } from 'react';

import type { ChangeEvent } from 'react';
import type { ConfigState } from '@petquery/api-client';
import type { ConfigValues } from '@petquery/api-client';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { Language } from '#gui/i18n';
import type { Translate } from '#gui/i18n';

// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

// Flattens value into dotted paths, so that two configs can be compared
// field by field. Arrays are compared as sets.
function flatten(
	value:unknown,
	prefix:utf8_t,
	out:Map<utf8_t,utf8_t>,
	preserveArrayOrder:bool_t = false
):void{
	if(Array.isArray(value)){
		const json = preserveArrayOrder
			? JSON.stringify(value)
			: JSON.stringify(value.map(String).sort());
		out.set(prefix,json);
		return;
	}
	if('object' === typeof value && null !== value){
		for(const [key,child] of Object.entries(value)){
			const path = '' === prefix ? key : `${prefix}.${key}`;
			flatten(
				child,
				path,
				out,
				preserveArrayOrder
					|| path.startsWith('authenticate.plugin_options')
			);
		}
		return;
	}
	out.set(prefix,JSON.stringify(value));
}

// Returns the paths of the fields that differ between a and b.
function diffPaths(a:ConfigValues,b:ConfigValues):Array<utf8_t>{
	const left = new Map<utf8_t,utf8_t>();
	const right = new Map<utf8_t,utf8_t>();
	const ret:Array<utf8_t> = [];

	flatten(a,'',left);
	flatten(b,'',right);
	for(const key of new Set([...left.keys(),...right.keys()])){
		if(left.get(key) !== right.get(key)){
			ret.push(key);
		}
	}
	return ret;
}

function formatMs(
	ms:uint_t,
	language:Language,
	t:Translate
):utf8_t{
	const formatter = new Intl.NumberFormat(language);
	if(!Number.isFinite(ms)){
		return '';
	}
	if(ms < 1000){
		return `${formatter.format(ms)} ${t('ms')}`;
	}
	if(ms < 60000){
		return `${formatter.format(ms / 1000)} ${t('s')}`;
	}
	return `${formatter.format(Math.round(ms / 600) / 100)} `
		+`${t('min')}`;
}

function formatBytes(bytes:uint_t,language:Language):utf8_t{
	if(!Number.isFinite(bytes)){
		return '';
	}
	const formatted = new Intl.NumberFormat(language,{
		maximumFractionDigits:2
	}).format(bytes / 1048576);
	return `${formatted} MiB`;
}

function isJson(value:unknown):value is json_t{
	if(null === value
	|| 'string' === typeof value
	|| 'boolean' === typeof value){
		return true;
	}
	if('number' === typeof value){
		return Number.isFinite(value);
	}
	if(Array.isArray(value)){
		return value.every(isJson);
	}
	if('object' === typeof value){
		return Object.values(value).every(isJson);
	}
	return false;
}

function isJsonRecord(
	value:unknown
):value is Record<utf8_t,json_t>{
	return 'object' === typeof value
		&& null !== value
		&& !Array.isArray(value)
		&& Object.values(value).every(isJson);
}

function parsePluginOptions(
	text:utf8_t,
	t:Translate
):Record<utf8_t,json_t>{
	const value:unknown = JSON.parse(text);
	if(!isJsonRecord(value)){
		throw new Error(t('Plugin options must be a JSON object'));
	}
	return value;
}

// Returns the reasons why saving values might lock the admin out.
function getWarnings(
	values:ConfigValues,
	t:Translate
):Array<utf8_t>{
	const ret:Array<utf8_t> = [];

	if(!values.route.api.enabled){
		ret.push(t(
			'Disabling the API route also disables /api/config/* and '
			+'/api/server/*. This page will stop working after a restart.'
		));
	}
	return ret;
}

function renderNumberField(
	label:utf8_t,
	value:uint_t,
	min:uint_t,
	max:uint_t,
	hint:utf8_t,
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
				onChange={(event:ChangeEvent<HTMLInputElement>)=>{
					onChange(event.target.valueAsNumber);
				}}
			/>
			<small className="muted">{hint}</small>
		</label>
	);
}

function renderCheckboxField(
	label:utf8_t,
	checked:bool_t,
	onChange:(checked:bool_t)=>void
):ReactElement{
	return (
		<label className="check">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event:ChangeEvent<HTMLInputElement>)=>{
					onChange(event.target.checked);
				}}
			/>
			{label}
		</label>
	);
}

function renderTextField(
	label:utf8_t,
	value:utf8_t,
	onChange:(value:utf8_t)=>void,
	type:'text'|'password' = 'text'
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

export function Config(props:{token:utf8_t}):ReactElement{
	const token = props.token;
	const {language,t} = useI18n();
	const {busy,error,run} = useAction();
	const numberField = (
		label:utf8_t,
		value:uint_t,
		min:uint_t,
		max:uint_t,
		hint:utf8_t,
		onChange:(value:uint_t)=>void
	):ReactElement=>{
		return renderNumberField(
			t(label),value,min,max,hint,onChange
		);
	};
	const checkboxField = (
		label:utf8_t,
		checked:bool_t,
		onChange:(checked:bool_t)=>void
	):ReactElement=>{
		return renderCheckboxField(t(label),checked,onChange);
	};
	const textField = (
		label:utf8_t,
		value:utf8_t,
		onChange:(value:utf8_t)=>void,
		type:'text'|'password' = 'text'
	):ReactElement=>{
		return renderTextField(t(label),value,onChange,type);
	};
	const [state,setState] = useState<ConfigState|null>(null);
	const [form,setForm] = useState<ConfigValues|null>(null);
	const [pluginOptionsText,setPluginOptionsText] = useState<utf8_t>('');
	const [pluginOptionsError,setPluginOptionsError] =
		useState<utf8_t|null>(null);

	const load = useCallback(async (loadToken:utf8_t):Promise<void>=>{
		const next = await getConfig(loadToken);
		const values = next.saved ?? next.active;
		setState(next);
		setForm(structuredClone(values));
		setPluginOptionsText(JSON.stringify(
			values.authenticate.plugin_options,
			null,
			2
		));
		setPluginOptionsError(null);
	},[]);

	// Loads on open using the signed-in session cookie.
	useEffect(()=>{
		run(async ()=>{
			await load(token);
		});
	},[run,load,token]);

	function edit(change:(draft:ConfigValues)=>void):void{
		setForm((current)=>{
			if(null === current){
				return current;
			}
			const draft = structuredClone(current);
			change(draft);
			return draft;
		});
	}

	if(null === state || null === form){
		return (
			<>
				{null !== error && <pre className="error">{error}</pre>}
				<Panel>
					<h2>{t('Config')}</h2>
					<p className="muted">
						{t(
							'Viewing and editing the config requires an '
							+'admin session.'
						)}
					</p>
					<Framework7Button
						type="button"
						disabled={busy}
						onClick={()=>{
							run(async ()=>{
								await load(token);
							});
						}}
					>
						{t('Load')}
					</Framework7Button>
				</Panel>
			</>
		);
	}

	const baseline = state.saved ?? state.active;
	const unsaved = diffPaths(form,baseline);
	const pending = null === state.saved
		? []
		: diffPaths(state.active,state.saved);
	const sync = form.index.sync;
	const upload = form.file.upload;

	function setPlugin(name:utf8_t,enabled:bool_t):void{
		edit((draft)=>{
			const plugins = draft.route.api.plugins.filter((entry)=>{
				return name !== entry;
			});
			if(enabled){
				plugins.push(name);
			}
			draft.route.api.plugins = plugins;
		});
	}

	function onReload():void{
		if(0 < unsaved.length
		&& !window.confirm(t('Discard unsaved changes?'))){
			return;
		}
		run(async ()=>{
			await load(token);
		});
	}

	function onReset():void{
		setForm(structuredClone(baseline));
		setPluginOptionsText(JSON.stringify(
			baseline.authenticate.plugin_options,
			null,
			2
		));
		setPluginOptionsError(null);
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		if(null === state || null === form){
			return;
		}
		const current = state;
		const values = structuredClone(form);
		try{
			values.authenticate.plugin_options =
				parsePluginOptions(pluginOptionsText,t);
			setPluginOptionsError(null);
		}
		catch(error){
			setPluginOptionsError(
				error instanceof Error
					? error.message
					: t('Invalid plugin options JSON')
			);
			return;
		}
		const warnings = getWarnings(values,t);
		if(0 < warnings.length
		&& !window.confirm(t('{warnings}\n\nSave anyway?',{
			warnings:warnings.join('\n\n')
		}))){
			return;
		}
		run(async ()=>{
			const saved = await saveConfig(token,values);
			setState({...current,saved});
			setForm(structuredClone(saved));
			setPluginOptionsText(JSON.stringify(
				saved.authenticate.plugin_options,
				null,
				2
			));
		});
	}

	return (
		<>
			{null !== error && <pre className="error">{error}</pre>}
			{0 < pending.length && <div className="banner">
				{t('Saved changes take effect when the server restarts:')}{' '}
				<code>{pending.join(', ')}</code>
			</div>}

			<form onSubmit={onSubmit}>
				<Panel>
					<h2>{t('HTTP')}</h2>
					{numberField(
						'Port',form.http.port,1,65535,'',
						(value)=>{
							edit((draft)=>{
								draft.http.port = value;
							});
						}
					)}
					<label className="field">
						<span>{t('Trusted proxy IPs/CIDRs')}</span>
						<textarea
							rows={4}
							value={form.http.trusted_proxies.join('\n')}
							onChange={(event)=>{
								const entries =
									event.target.value.split('\n');
								const trustedProxies:Array<utf8_t> = [];
								for(const entry of entries){
									const proxy = entry.trim();
									if('' !== proxy){
										trustedProxies.push(proxy);
									}
								}
								edit((draft)=>{
									draft.http.trusted_proxies =
										trustedProxies;
								});
							}}
						/>
						<small className="muted">
							{t(
								'One trusted proxy IP or CIDR per line. Only '
								+'trust X-Forwarded-For from these proxies. '
								+'Leave empty for direct connections.'
							)}
						</small>
					</label>
				</Panel>

				<Panel>
					<h2>Bearer tokens</h2>
					<div className="auth-fields">
						<label className="field">
							<span>{t('Enabled providers')}</span>
							<textarea
								rows={4}
								value={
									form.authenticate.providers.join('\n')
								}
								onChange={(event)=>{
									const providers = event.target.value
										.split('\n')
										.map((provider)=>{
											return provider.trim();
										})
										.filter((provider)=>{
											return '' !== provider
												&& 'bearer' !== provider;
										});
									edit((draft)=>{
										draft.authenticate.providers =
											Array.from(new Set(providers));
									});
								}}
							/>
							<small className="muted">
								{t(
									'Enter one registered provider name per '
									+'line. Names are selected explicitly at '
									+'sign in.'
								)}
							</small>
						</label>
						{t('Clients send one of these as')}
						{' '}<code>Authorization: ******;token&gt;</code>.
						{' '}{t('At least 16 printable characters, no spaces.')}
						{textField(
							'Legacy mode value (compatibility only)',
							form.authenticate.mode,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.mode = value;
								});
							}
						)}
					<label className="field">
							<span>{t('Common legacy mode values')}</span>
							<select
								value={form.authenticate.mode}
								onChange={(event)=>{
									const value = event.target.value;
									if('' !== value && 'bearer' !== value){
										edit((draft)=>{
											draft.authenticate.mode = value;
										});
									}
								}}
							>
								<option value="bearer">Bearer tokens</option>
								{'bearer' !== form.authenticate.mode
								&& 'lmdb' !== form.authenticate.mode
								&& 'ldap' !== form.authenticate.mode
								&& 'oidc' !== form.authenticate.mode
									&& <option
										value={form.authenticate.mode}
									>
										{form.authenticate.mode}
									</option>}
								<option value="lmdb">{t('LMDB users')}</option>
								<option value="ldap">{t('LDAP')}</option>
								<option value="oidc">{t('OpenID Connect')}</option>
							</select>
						</label>
						<p className="muted">
							Bearer credentials are managed under API clients.
							{t('They cannot sign in to the admin GUI.')}
						</p>
						{checkboxField(
							'Secure session cookie',
							form.authenticate.session.secure,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.session.secure = value;
								});
							}
						)}
						{textField(
							'Session cookie name',
							form.authenticate.session.cookie_name,
							(value)=>{
								edit((draft)=>{
									draft.authenticate.session.cookie_name =
										value;
								});
							}
						)}
						{numberField(
							'Session lifetime (ms)',
							form.authenticate.session.max_age,
							60000,
							2147483647,
							formatMs(
								form.authenticate.session.max_age,
								language,
								t
							),
							(value)=>{
								edit((draft)=>{
									draft.authenticate.session.max_age =
										value;
								});
							}
						)}
						{form.authenticate.providers.includes('lmdb') && <>
							{textField(
								'Users database',
								form.authenticate.lmdb.users_name,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.lmdb.users_name =
											value;
									});
								}
							)}
							{textField(
								'Sessions database',
								form.authenticate.lmdb.sessions_name,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.lmdb
											.sessions_name = value;
									});
								}
							)}
						</>}
						{form.authenticate.providers.includes('ldap') && <>
							{textField(
								'LDAP URL',
								form.authenticate.ldap.url,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap.url = value;
									});
								}
							)}
							{textField(
								'Bind DN',
								form.authenticate.ldap.bind_dn,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap.bind_dn =
											value;
									});
								}
							)}
							{textField(
								'Bind password',
								form.authenticate.ldap.bind_password,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap
											.bind_password = value;
									});
								},
								'password'
							)}
							{textField(
								'User base DN',
								form.authenticate.ldap.base_dn,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap.base_dn =
											value;
									});
								}
							)}
							{textField(
								'User filter',
								form.authenticate.ldap.user_filter,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap.user_filter =
											value;
									});
								}
							)}
							{textField(
								'Admin group',
								form.authenticate.ldap.admin_group,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.ldap.admin_group =
											value;
									});
								}
							)}
						</>}
						{form.authenticate.providers.includes('oidc') && <>
							{textField(
								'Issuer',
								form.authenticate.oidc.issuer,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc.issuer =
											value;
									});
								}
							)}
							{textField(
								'Client ID',
								form.authenticate.oidc.client_id,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc.client_id =
											value;
									});
								}
							)}
							{textField(
								'Client secret',
								form.authenticate.oidc.client_secret,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc
											.client_secret = value;
									});
								},
								'password'
							)}
							{textField(
								'Redirect URI',
								form.authenticate.oidc.redirect_uri,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc
											.redirect_uri = value;
									});
								}
							)}
							{textField(
								'Scopes',
								form.authenticate.oidc.scopes,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc.scopes =
											value;
									});
								}
							)}
							{textField(
								'Admin group',
								form.authenticate.oidc.admin_group,
								(value)=>{
									edit((draft)=>{
										draft.authenticate.oidc.admin_group =
											value;
									});
								}
							)}
						</>}
						{' '}<code>Authorization: Bearer &lt;token&gt;</code>.
						At least 16 printable characters, no spaces.
					</div>
					<label className="field">
						<span>{t('Provider options (JSON)')}</span>
						<textarea
							rows={10}
							spellCheck={false}
							value={pluginOptionsText}
							onChange={(event)=>{
								setPluginOptionsText(event.target.value);
								setPluginOptionsError(null);
							}}
						/>
					</label>
					{null !== pluginOptionsError
						&& <pre className="error">{pluginOptionsError}</pre>}
				</Panel>

				<Panel>
					<h2>{t('Results')}</h2>
					{numberField(
						'Max results per plugin',
						form.max_results_per_module,1,1000000,'',
						(value)=>{
							edit((draft)=>{
								draft.max_results_per_module = value;
							});
						}
					)}
					{numberField(
						'Max results in total',
						form.max_results_total,1,1000000,'',
						(value)=>{
							edit((draft)=>{
								draft.max_results_total = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('File upload')}</h2>
					{checkboxField('Enabled',upload.enabled,(value)=>{
						edit((draft)=>{
							draft.file.upload.enabled = value;
						});
					})}
					{numberField(
						'Max file size (bytes)',
						upload.max_file_size,1,Number.MAX_SAFE_INTEGER,
						formatBytes(upload.max_file_size,language),
						(value)=>{
							edit((draft)=>{
								draft.file.upload.max_file_size = value;
							});
						}
					)}
				</Panel>

				<Panel>
					<h2>{t('Peer sync')}</h2>
					{checkboxField('Enabled',sync.enabled,(value)=>{
						edit((draft)=>{
							draft.index.sync.enabled = value;
						});
					})}
					{numberField(
						'Interval (ms)',sync.interval,1000,MAX_TIMER_MS,
						formatMs(sync.interval,language,t),
						(value)=>{
							edit((draft)=>{
								draft.index.sync.interval = value;
							});
						}
					)}
					{numberField(
						'Request timeout (ms)',sync.timeout,100,MAX_TIMER_MS,
						formatMs(sync.timeout,language,t),
						(value)=>{
							edit((draft)=>{
								draft.index.sync.timeout = value;
							});
						}
					)}
					{numberField(
						'Max servers read per peer',
						sync.max_servers,1,1000000,'',
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
						'/api (includes this page\'s API)',
						form.route.api.enabled,
						(value)=>{
							edit((draft)=>{
								draft.route.api.enabled = value;
							});
						}
					)}
					<h3>{t('Plugins queried by /api')}</h3>
					{state.plugins.map((name)=>{
						return (
							<div key={name}>
								{checkboxField(
									name,
									form.route.api.plugins.includes(name),
									(value)=>{
										setPlugin(name,value);
									}
								)}
							</div>
						);
					})}
				</Panel>

				<div className="actions">
					<Framework7Button
						type="submit"
						disabled={busy || 0 === unsaved.length}
						fill
					>
						{t('Save')}
					</Framework7Button>
					<Framework7Button
						type="button"
						disabled={busy || 0 === unsaved.length}
						outline
						onClick={onReset}
					>
						{t('Reset')}
					</Framework7Button>
					<Framework7Button
						type="button"
						disabled={busy}
						outline
						onClick={onReload}
					>
						{t('Reload')}
					</Framework7Button>
					<span className="muted">
						{0 < unsaved.length
							? t('Unsaved: {paths}',{
								paths:unsaved.join(', ')
							})
							: t('No unsaved changes.')}
					</span>
				</div>
			</form>
		</>
	);
}
