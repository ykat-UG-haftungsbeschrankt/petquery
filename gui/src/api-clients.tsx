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
import { updateApiClient } from '@petquery/api-client';
import { Button as Framework7Button } from 'framework7-react';
import { DataTable } from '#gui/data-table';
import { Panel } from '#gui/panel';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { ApiClient } from '@petquery/api-client';
import type { ApiClientSettings } from '@petquery/api-client';
import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';

type ApiClientPermission =
	typeof API_CLIENT_PERMISSION_CATALOG[number]['id'];
type ApiClientPermissionValue = ApiClientSettings['permissions'][number];

const API_CLIENT_COLUMNS:Array<DataTableColumn<ApiClient>> = [
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
				? 'All listed API calls'
				: client.permissions.join(', ');
		},
		render:(client)=>{
			if(client.permissions.includes('*')){
				return 'All listed API calls';
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
		}
	}
];

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
	const {busy,error,run} = useAction();
	const [clients,setClients] = useState<Array<ApiClient>>([]);
	const [editingId,setEditingId] = useState<utf8_t|null>(null);
	const [name,setName] = useState<utf8_t>('');
	const [allowedIpsText,setAllowedIpsText] = useState<utf8_t>('');
	const [permissions,setPermissions] =
		useState<Array<ApiClientPermissionValue>>([]);
	const [revealedToken,setRevealedToken] = useState<utf8_t|null>(null);

	const refresh = useCallback(async ():Promise<void>=>{
		setClients(await listApiClients(props.token));
	},[props.token]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

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
		if(!window.confirm(`Revoke API client "${client.name}"?`)){
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

	const canSubmit = !busy
		&& '' !== name.trim()
		&& 0 < parseAllowedIps(allowedIpsText).length
		&& 0 < permissions.length;

	return (
		<>
			{null !== error && <pre className="error">{error}</pre>}
			{null !== revealedToken && <Panel>
				<h2>Copy the new API-client token</h2>
				<p className="banner">
					This token is shown only once. Store it securely; the
					server keeps only its hash.
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
					Dismiss
				</Framework7Button>
			</Panel>}
			<Panel>
				<div className="page-heading">
					<div>
						<h2>API clients</h2>
						<p className="muted">
							Manage bearer credentials for API and
							server-to-server requests. These clients cannot
							sign in to the admin GUI.
						</p>
					</div>
					<Framework7Button
						type="button"
						disabled={busy}
						onClick={()=>{
							run(refresh);
						}}
					>
						Refresh
					</Framework7Button>
				</div>
				<DataTable
					rows={clients}
					columns={API_CLIENT_COLUMNS}
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
								Edit
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									revokeClient(client);
								}}
							>
								Revoke
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			<Panel>
				<h2>
					{null === editingId
						? 'Create API client'
						: 'Edit API client'}
				</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>Name</span>
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
						<span>Allowed source IPs</span>
						<textarea
							required
							rows={3}
							value={allowedIpsText}
							onChange={(event)=>{
								setAllowedIpsText(event.target.value);
							}}
						/>
						<small className="muted">
							Enter exact IPv4 or IPv6 addresses, one per line.
							Use * to allow any source IP. For proxied requests,
							configure proxy IPs/CIDRs in Config, under HTTP;
							only their X-Forwarded-For values are trusted.
						</small>
					</label>
					<fieldset className="api-client-permissions">
						<legend>Allowed API calls</legend>
						<p className="muted">
							Scopes apply when this bearer token is used.
							Existing public API routes remain available
							without a token.
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
							All listed /api calls
						</label>
						<p className="muted">
							API-client management and user-management routes
							always require an admin session.
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
									<span>{permission.label}</span>
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
							? 'Create client'
							: 'Save client'}
					</Framework7Button>
					{null !== editingId && (
						<Framework7Button
							type="button"
							disabled={busy}
							onClick={resetForm}
						>
							Cancel
						</Framework7Button>
					)}
				</form>
			</Panel>
		</>
	);
}
