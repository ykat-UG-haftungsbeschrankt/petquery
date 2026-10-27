/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { addServer } from '@petquery/api-client';
import { Button as Framework7Button } from 'framework7-react';
import { DataTable } from '#gui/data-table';
import { deleteServer } from '@petquery/api-client';
import { listServers } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { ping } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { ServerEntry } from '@petquery/api-client';

function formatTime(value:utf8_t|null):utf8_t{
	return null === value ? 'Never' : new Date(value).toLocaleString();
}

const SERVER_COLUMNS:Array<DataTableColumn<ServerEntry>> = [
	{
		key:'gid',
		label:'GID',
		value:(server)=>server.gid,
		render:(server)=><code>{server.gid}</code>
	},
	{
		key:'uri',
		label:'URI',
		value:(server)=>server.uri,
		render:(server)=>(
			<a href={server.uri} target="_blank" rel="noreferrer">
				{server.uri}
			</a>
		)
	},
	{
		key:'adminContact',
		label:'Admin contact',
		value:(server)=>server.adminContact
	},
	{
		key:'companyAddress',
		label:'Company address',
		value:(server)=>server.companyAddress
	},
	{
		key:'pingTimeMs',
		label:'Ping latency (ms)',
		value:(server)=>server.pingTimeMs,
		render:(server)=>{
			return null === server.pingTimeMs
				? 'Not pinged'
				: `${server.pingTimeMs} ms`;
		}
	},
	{
		key:'addedAt',
		label:'Added time',
		value:(server)=>server.addedAt,
		render:(server)=>formatTime(server.addedAt)
	},
	{
		key:'updatedAt',
		label:'Updated time',
		value:(server)=>server.updatedAt,
		render:(server)=>formatTime(server.updatedAt)
	},
	{
		key:'lastPingAt',
		label:'Last ping time',
		value:(server)=>server.lastPingAt,
		render:(server)=>formatTime(server.lastPingAt)
	}
];

export function Servers(props:{token:utf8_t}):ReactElement{
	const token = props.token;
	const {busy,error,run} = useAction();
	const [ownGid,setOwnGid] = useState<uuid_t|null>(null);
	const [servers,setServers] = useState<Array<ServerEntry>>([]);
	const [formGid,setFormGid] = useState<utf8_t>('');
	const [formUri,setFormUri] = useState<utf8_t>('');
	const [formAdminContact,setFormAdminContact] = useState<utf8_t>('');
	const [formCompanyAddress,setFormCompanyAddress] =
		useState<utf8_t>('');

	const refresh = useCallback(async ():Promise<void>=>{
		const [gid,list] = await Promise.all([ping(),listServers()]);
		setOwnGid(gid);
		setServers(list);
	},[]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const gid = formGid.trim();
		const uri = formUri.trim();
		const adminContact = formAdminContact.trim();
		const companyAddress = formCompanyAddress.trim();
		run(async ()=>{
			await addServer(
				token,
				gid,
				uri,
				adminContact,
				companyAddress
			);
			setFormGid('');
			setFormUri('');
			setFormAdminContact('');
			setFormCompanyAddress('');
			await refresh();
		});
	}

	function onEdit(server:ServerEntry):void{
		setFormGid(server.gid);
		setFormUri(server.uri);
		setFormAdminContact(server.adminContact);
		setFormCompanyAddress(server.companyAddress);
	}

	function onDelete(server:ServerEntry):void{
		if(!window.confirm(`Delete server ${server.gid}?`)){
			return;
		}
		run(async ()=>{
			await deleteServer(token,server.gid);
			await refresh();
		});
	}

	const canWrite = !busy && '' !== token;

	return (
		<>
			<p className="muted">
				This server: <code>{ownGid ?? '…'}</code>
			</p>

			{null !== error && <pre className="error">{error}</pre>}

			<Panel>
				<h2>Servers</h2>
				<p className="muted">
					Ping latency is measured from this server. Contact and
					address details are shared with connected peers.
				</p>
				<Framework7Button
					type="button"
					disabled={busy}
					onClick={()=>{
						run(refresh);
					}}
				>
					Refresh
				</Framework7Button>
				<DataTable
					rows={servers}
					columns={SERVER_COLUMNS}
					filterLabel="servers"
					emptyMessage="No servers known."
					rowKey={(server)=>server.gid}
					renderActions={(server)=>(
						<>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									onEdit(server);
								}}
							>
								Edit
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={!canWrite}
								onClick={()=>{
									onDelete(server);
								}}
							>
								Delete
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			<Panel>
				<h2>Add or replace server</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>GID</span>
						<input
							required
							value={formGid}
							onChange={(event)=>{
								setFormGid(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>URI</span>
						<input
							required
							type="url"
							placeholder="https://registry.example.org/"
							value={formUri}
							onChange={(event)=>{
								setFormUri(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Admin contact</span>
						<input
							maxLength={1024}
							value={formAdminContact}
							onChange={(event)=>{
								setFormAdminContact(event.target.value);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Company address</span>
						<textarea
							rows={3}
							maxLength={4096}
							value={formCompanyAddress}
							onChange={(event)=>{
								setFormCompanyAddress(event.target.value);
							}}
						/>
					</label>
					<Framework7Button
						type="submit"
						disabled={!canWrite}
						fill
					>
						Save
					</Framework7Button>
				</form>
			</Panel>
		</>
	);
}
