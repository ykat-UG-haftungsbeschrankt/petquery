/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useCallback, useEffect, useState} from 'react';
import type {ChangeEvent, FormEvent, ReactElement} from 'react';
import {getConfig, saveConfig} from './api';
import type {ConfigState, ConfigValues} from './api';
import {useAction} from './action';

// setTimeout() fires immediately for delays above 2^31-1 ms.
const MAX_TIMER_MS = 2147483647;

// Flattens value into dotted paths, so that two configs can be compared
// field by field. Arrays are compared as sets.
function flatten(
	value:unknown,
	prefix:utf8_t,
	out:Map<utf8_t,utf8_t>
):void{
	if(Array.isArray(value)){
		out.set(prefix,JSON.stringify(value.map(String).sort()));
		return;
	}
	if('object' === typeof value && null !== value){
		for(const [key,child] of Object.entries(value)){
			flatten(child,'' === prefix ? key : `${prefix}.${key}`,out);
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

function generateToken():utf8_t{
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes,(byte)=>{
		return byte.toString(16).padStart(2,'0');
	}).join('');
}

function formatMs(ms:uint_t):utf8_t{
	if(!Number.isFinite(ms)){
		return '';
	}
	if(ms < 1000){
		return `${ms} ms`;
	}
	if(ms < 60000){
		return `${ms / 1000} s`;
	}
	return `${Math.round(ms / 600) / 100} min`;
}

function formatBytes(bytes:uint_t):utf8_t{
	if(!Number.isFinite(bytes)){
		return '';
	}
	return `${Math.round(bytes / 10485.76) / 100} MiB`;
}

// Returns the reasons why saving values might lock the admin out.
function getWarnings(values:ConfigValues,token:utf8_t):Array<utf8_t>{
	const ret:Array<utf8_t> = [];

	if(!values.authenticate.bearer.includes(token)){
		ret.push(
			'The token you are using is not in the list. After a restart'
			+' it no longer gives access to this page.'
		);
	}
	if(!values.route.api.enabled){
		ret.push(
			'Disabling the API route also disables /api/config and'
			+' /api/server. This page will stop working after a restart.'
		);
	}
	if(!values.route.admin.enabled){
		ret.push('Disabling the admin route turns off this GUI.');
	}
	return ret;
}

function numberField(
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
				onChange={(event:ChangeEvent<HTMLInputElement>)=>{
					onChange(event.target.checked);
				}}
			/>
			{label}
		</label>
	);
}

export function Config(props:{token:utf8_t}):ReactElement{
	const token = props.token;
	const {busy,error,run} = useAction();
	const [initialToken] = useState<utf8_t>(token);
	const [state,setState] = useState<ConfigState|null>(null);
	const [form,setForm] = useState<ConfigValues|null>(null);

	const load = useCallback(async (loadToken:utf8_t):Promise<void>=>{
		const next = await getConfig(loadToken);
		setState(next);
		setForm(structuredClone(next.saved ?? next.active));
	},[]);

	// Loads once on open; later token edits must not fire requests per key.
	useEffect(()=>{
		if('' !== initialToken){
			run(async ()=>{
				await load(initialToken);
			});
		}
	},[run,load,initialToken]);

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
				<section>
					<h2>Config</h2>
					<p className="muted">
						Viewing and editing the config requires the token.
					</p>
					<button
						type="button"
						disabled={busy || '' === token}
						onClick={()=>{
							run(async ()=>{
								await load(token);
							});
						}}
					>
						Load
					</button>
				</section>
			</>
		);
	}

	const baseline = state.saved ?? state.active;
	const unsaved = diffPaths(form,baseline);
	const pending = null === state.saved
		? []
		: diffPaths(state.active,state.saved);
	const sync = form.server_index.sync;
	const upload = form.file.upload;

	function setTokenAt(index:size_t,value:utf8_t):void{
		edit((draft)=>{
			draft.authenticate.bearer[index] = value;
		});
	}

	function removeTokenAt(index:size_t):void{
		edit((draft)=>{
			draft.authenticate.bearer.splice(index,1);
		});
	}

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
		&& !window.confirm('Discard unsaved changes?')){
			return;
		}
		run(async ()=>{
			await load(token);
		});
	}

	function onReset():void{
		setForm(structuredClone(baseline));
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		if(null === state || null === form){
			return;
		}
		const current = state;
		const values = structuredClone(form);
		values.authenticate.bearer = values.authenticate.bearer
			.map((value)=>{
				return value.trim();
			})
			.filter((value)=>{
				return '' !== value;
			});
		const warnings = getWarnings(values,token);
		if(0 < warnings.length
		&& !window.confirm(`${warnings.join('\n\n')}\n\nSave anyway?`)){
			return;
		}
		run(async ()=>{
			const saved = await saveConfig(token,values);
			setState({...current,saved,savedError:null});
			setForm(structuredClone(saved));
		});
	}

	return (
		<>
			{null !== error && <pre className="error">{error}</pre>}
			{null !== state.savedError && <pre className="error">
				The config file cannot be read: {state.savedError}
				{'\n'}Saving replaces it.
			</pre>}
			{0 < pending.length && <div className="banner">
				Saved changes take effect when the server restarts:{' '}
				<code>{pending.join(', ')}</code>
			</div>}

			<form onSubmit={onSubmit}>
				<section>
					<h2>HTTP</h2>
					{numberField(
						'Port',form.http.port,1,65535,'',
						(value)=>{
							edit((draft)=>{
								draft.http.port = value;
							});
						}
					)}
				</section>

				<section>
					<h2>Bearer tokens</h2>
					<p className="muted">
						Clients send one of these as
						{' '}<code>Authorization: Bearer &lt;token&gt;</code>.
						At least 16 printable characters, no spaces.
					</p>
					{form.authenticate.bearer.map((value,index)=>{
						return (
							<div className="row" key={index}>
								<input
									className="token"
									required
									minLength={16}
									maxLength={256}
									pattern="[\x21-\x7e]+"
									spellCheck={false}
									autoComplete="off"
									value={value}
									onChange={(event)=>{
										setTokenAt(index,event.target.value);
									}}
								/>
								{token === value
									&& <small className="muted">in use</small>}
								<button
									type="button"
									disabled={
										1 === form.authenticate.bearer.length
									}
									onClick={()=>{
										removeTokenAt(index);
									}}
								>
									Remove
								</button>
							</div>
						);
					})}
					<button
						type="button"
						onClick={()=>{
							const next = generateToken();
							edit((draft)=>{
								draft.authenticate.bearer.push(next);
							});
						}}
					>
						Add generated token
					</button>
				</section>

				<section>
					<h2>Results</h2>
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
				</section>

				<section>
					<h2>File upload</h2>
					{checkboxField('Enabled',upload.enabled,(value)=>{
						edit((draft)=>{
							draft.file.upload.enabled = value;
						});
					})}
					{numberField(
						'Max file size (bytes)',
						upload.max_file_size,1,Number.MAX_SAFE_INTEGER,
						formatBytes(upload.max_file_size),
						(value)=>{
							edit((draft)=>{
								draft.file.upload.max_file_size = value;
							});
						}
					)}
				</section>

				<section>
					<h2>Peer sync</h2>
					{checkboxField('Enabled',sync.enabled,(value)=>{
						edit((draft)=>{
							draft.server_index.sync.enabled = value;
						});
					})}
					{numberField(
						'Interval (ms)',sync.interval,1000,MAX_TIMER_MS,
						formatMs(sync.interval),
						(value)=>{
							edit((draft)=>{
								draft.server_index.sync.interval = value;
							});
						}
					)}
					{numberField(
						'Request timeout (ms)',sync.timeout,100,MAX_TIMER_MS,
						formatMs(sync.timeout),
						(value)=>{
							edit((draft)=>{
								draft.server_index.sync.timeout = value;
							});
						}
					)}
					{numberField(
						'Max servers read per peer',
						sync.max_servers,1,1000000,'',
						(value)=>{
							edit((draft)=>{
								draft.server_index.sync.max_servers = value;
							});
						}
					)}
				</section>

				<section>
					<h2>Routes</h2>
					{checkboxField(
						'/api (includes this page\'s API)',
						form.route.api.enabled,
						(value)=>{
							edit((draft)=>{
								draft.route.api.enabled = value;
							});
						}
					)}
					{checkboxField(
						'/json',
						form.route.json.enabled,
						(value)=>{
							edit((draft)=>{
								draft.route.json.enabled = value;
							});
						}
					)}
					{checkboxField(
						'/ (HTML search page)',
						form.route['/'].enabled,
						(value)=>{
							edit((draft)=>{
								draft.route['/'].enabled = value;
							});
						}
					)}
					{checkboxField(
						'/admin (this GUI)',
						form.route.admin.enabled,
						(value)=>{
							edit((draft)=>{
								draft.route.admin.enabled = value;
							});
						}
					)}
					<h3>Plugins queried by /api</h3>
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
				</section>

				<div className="actions">
					<button
						type="submit"
						disabled={busy || 0 === unsaved.length}
					>
						Save
					</button>
					<button
						type="button"
						disabled={busy || 0 === unsaved.length}
						onClick={onReset}
					>
						Reset
					</button>
					<button type="button" disabled={busy} onClick={onReload}>
						Reload
					</button>
					<span className="muted">
						{0 < unsaved.length
							? `Unsaved: ${unsaved.join(', ')}`
							: 'No unsaved changes.'}
					</span>
				</div>
			</form>
		</>
	);
}
