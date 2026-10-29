/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { API_CLIENT_PERMISSION_CATALOG } from '@petquery/api-client';
import { createApiClient } from '@petquery/api-client';
import { deleteApiClient } from '@petquery/api-client';
import { listApiClients } from '@petquery/api-client';
import { rotateApiClientToken } from '@petquery/api-client';
import { updateApiClient } from '@petquery/api-client';
import { Button as Framework7Button } from 'framework7-react';
import { DataTable } from '#gui/data-table';
import { Panel } from '#gui/panel';
import { useI18n } from '#gui/i18n';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';

import type { ApiClient } from '@petquery/api-client';
import type { ApiClientSettings } from '@petquery/api-client';
import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { Language } from '#gui/i18n';
import type { Translate } from '#gui/i18n';

type ApiClientPermission =
	typeof API_CLIENT_PERMISSION_CATALOG[number]['id'];
type ApiClientPermissionValue = ApiClientSettings['permissions'][number];

function getApiClientColumns(
	t:Translate,
	language:Language
):Array<DataTableColumn<ApiClient>>{
	return [
	{
		key:'name',
		label:'Name',
		value:(client)=>{
			return client.name;
		}
	},
	{
		key:'allowedIps',
		label:'Allowed IPs',
		value:(client)=>{
			return client.allowedIps.join(', ');
		}
	},
	{
		key:'permissions',
		label:'API permissions',
		value:(client)=>{
			return client.permissions.includes('*')
				? t('All listed API calls')
				: client.permissions.join(', ');
		},
		render:(client)=>{
			if(client.permissions.includes('*')){
				return t('All listed API calls');
			}
			return (
				<>
					{client.permissions.map((permission,index)=>{
						return (
							<span key={permission}>
								<code>{permission}</code>
								{index + 1 < client.permissions.length
									? ', '
									: ''}
							</span>
						);
					})}
				</>
			);
		}
	},
	{
		key:'updatedAt',
		label:'Last updated',
		value:(client)=>{
			return client.updatedAt;
		},
		render:(client)=>{
			return new Date(client.updatedAt).toLocaleString(language);
		}
	}
	];
}

function parseAllowedIps(value:utf8_t):Array<utf8_t>{
	const lines = value.split('\n');
	const ips:Array<utf8_t> = [];
	for(const line of lines){
		const ip = line.trim();
		if('' !== ip){
			ips.push(ip);
		}
	}
	return ips;
}

export function ApiClients(props:{token:utf8_t}):ReactElement{
	const {language,t} = useI18n();
	const {busy,error,run} = useAction();
	const [clients,setClients] = useState<Array<ApiClient>>([]);
	const [editingId,setEditingId] = useState<utf8_t|null>(null);
	const [name,setName] = useState<utf8_t>('');
	const [allowedIpsText,setAllowedIpsText] = useState<utf8_t>('');
	const [permissions,setPermissions] =
		useState<Array<ApiClientPermissionValue>>([]);
	const [revealedToken,setRevealedToken] = useState<utf8_t|null>(null);
	const tokenPanelRef = useRef<HTMLDivElement|null>(null);

	const refresh = useCallback(async ():Promise<void>=>{
		setClients(await listApiClients(props.token));
	},[props.token]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	useEffect(()=>{
		if(null !== revealedToken){
			tokenPanelRef.current?.scrollIntoView({
				behavior:'smooth',
				block:'start'
			});
		}
	},[revealedToken]);

	function resetForm():void{
		setEditingId(null);
		setName('');
		setAllowedIpsText('');
		setPermissions([]);
		setRevealedToken(null);
	}

	function editClient(client:ApiClient):void{
		setEditingId(client.id);
		setName(client.name);
		setAllowedIpsText(client.allowedIps.join('\n'));
		setPermissions(client.permissions);
		setRevealedToken(null);
	}

	function togglePermission(
		permission:ApiClientPermission,
		checked:bool_t
	):void{
		setPermissions((current)=>{
			const individual = current.filter((entry)=>{
				return '*' !== entry;
			});
			if(checked){
				if(individual.includes(permission)){
					return individual;
				}
				return [...individual,permission];
			}
			return individual.filter((entry)=>{
				return entry !== permission;
			});
		});
	}

	function toggleAllPermissions(checked:bool_t):void{
		setPermissions(checked ? ['*'] : []);
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const values:ApiClientSettings = {
			name:name.trim(),
			allowedIps:parseAllowedIps(allowedIpsText),
			permissions
		};
		run(async ()=>{
			if(null === editingId){
				const created = await createApiClient(props.token,values);
				resetForm();
				setRevealedToken(created.token);
			}else{
				await updateApiClient(props.token,editingId,values);
				resetForm();
			}
			await refresh();
		});
	}

	function revokeClient(client:ApiClient):void{
		if(!window.confirm(t('Revoke API client "{name}"?',{
			name:client.name
		}))){
			return;
		}
		run(async ()=>{
			await deleteApiClient(props.token,client.id);
			if(editingId === client.id){
				resetForm();
			}
			await refresh();
		});
	}

	function rotateToken(client:ApiClient):void{
		if(!window.confirm(t(
			'Rotate API-client token for "{name}"? This revokes the '
			+'current token.',
			{name:client.name}
		))){
			return;
		}
		setRevealedToken(null);
		run(async ()=>{
			const rotated = await rotateApiClientToken(
				props.token,
				client.id
			);
			setRevealedToken(rotated.token);
			await refresh();
		});
	}

	const canSubmit = !busy
		&& '' !== name.trim()
		&& 0 < parseAllowedIps(allowedIpsText).length
		&& 0 < permissions.length;
	const columns = getApiClientColumns(t,language);

	return (
		<>
			{null !== error && <pre className="error">{error}</pre>}
			{null !== revealedToken && <div ref={tokenPanelRef}>
				<Panel>
					<h2>{t('Copy the new API-client token')}</h2>
					<p className="banner">
						{t(
							'This token is shown only once. Store it '
							+'securely; the server keeps only its hash.'
						)}
					</p>
					<label className="field">
						<span>Bearer token</span>
						<textarea
							rows={3}
							readOnly
							value={revealedToken}
							onFocus={(event)=>{
								event.currentTarget.select();
							}}
						/>
					</label>
					<Framework7Button
						type="button"
						disabled={busy}
						onClick={()=>{
							setRevealedToken(null);
						}}
					>
						{t('Dismiss')}
					</Framework7Button>
				</Panel>
			</div>}
			<Panel>
				<div className="page-heading">
					<div>
						<h2>{t('API clients')}</h2>
						<p className="muted">
							{t(
								'Manage bearer credentials for API and '
								+'server-to-server requests. These clients '
								+'cannot sign in to the admin GUI.'
							)}
						</p>
					</div>
					<Framework7Button
						type="button"
						disabled={busy}
						onClick={()=>{
							run(refresh);
						}}
					>
						{t('Refresh')}
					</Framework7Button>
				</div>
				<DataTable
					rows={clients}
					columns={columns}
					filterLabel="API clients"
					emptyMessage="No API clients have been created."
					rowKey={(client)=>{
						return client.id;
					}}
					renderActions={(client)=>(
						<>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									editClient(client);
								}}
							>
								{t('Edit')}
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									rotateToken(client);
								}}
							>
								{t('Rotate token')}
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									revokeClient(client);
								}}
							>
								{t('Revoke')}
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			<Panel>
				<h2>
					{null === editingId
						? t('Create API client')
						: t('Edit API client')}
				</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>{t('Name')}</span>
						<input
							required
							maxLength={128}
							value={name}
							onChange={(event)=>{
								setName(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>{t('Allowed source IPs')}</span>
						<textarea
							required
							rows={3}
							value={allowedIpsText}
							onChange={(event)=>{
								setAllowedIpsText(event.target.value);
							}}
						/>
						<small className="muted">
							{t(
								'Enter exact IPv4 or IPv6 addresses, one per '
								+'line. Use * to allow any source IP. For '
								+'proxied requests, configure proxy IPs/CIDRs '
								+'in Config, under HTTP; only their '
								+'X-Forwarded-For values are trusted.'
							)}
						</small>
					</label>
					<fieldset className="api-client-permissions">
						<legend>{t('Allowed API calls')}</legend>
						<p className="muted">
							{t(
								'Scopes apply when this bearer token is '
								+'used. Existing public API routes remain '
								+'available without a token.'
							)}
						</p>
						<label className="check">
							<input
								type="checkbox"
								checked={permissions.includes('*')}
								disabled={busy}
								onChange={(event)=>{
									toggleAllPermissions(
										event.target.checked
									);
								}}
							/>
							{t('All listed /api calls')}
						</label>
						<p className="muted">
							{t(
								'API-client management and user-management '
								+'routes always require an admin session.'
							)}
						</p>
						{API_CLIENT_PERMISSION_CATALOG.map((permission)=>{
							return (
								<label className="check" key={permission.id}>
									<input
										type="checkbox"
										checked={
											permissions.includes('*')
											|| permissions.includes(
												permission.id
											)
										}
										disabled={
											busy
											|| permissions.includes('*')
										}
										onChange={(event)=>{
											togglePermission(
												permission.id,
												event.target.checked
											);
										}}
									/>
									<span>{t(permission.label)}</span>
									<code>{permission.id}</code>
								</label>
							);
						})}
					</fieldset>
					<Framework7Button
						type="submit"
						disabled={!canSubmit}
						fill
					>
						{null === editingId
							? t('Create client')
							: t('Save client')}
					</Framework7Button>
					{null !== editingId && (
						<Framework7Button
							type="button"
							disabled={busy}
							onClick={resetForm}
						>
							{t('Cancel')}
						</Framework7Button>
					)}
				</form>
			</Panel>
		</>
	);
}
