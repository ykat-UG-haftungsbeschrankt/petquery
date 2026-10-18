/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { addServer } from '#gui/api';
import { deleteServer } from '#gui/api';
import { listServers } from '#gui/api';
import { ping } from '#gui/api';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { FormEvent } from 'react';
import type { ReactElement } from 'react';
import type { ServerEntry } from '#gui/api';

export function Servers(props:{token:utf8_t}):ReactElement{
	const token = props.token;
	const {busy,error,run} = useAction();
	const [ownGid,setOwnGid] = useState<uuid_t|null>(null);
	const [servers,setServers] = useState<Array<ServerEntry>>([]);
	const [formGid,setFormGid] = useState<utf8_t>('');
	const [formUri,setFormUri] = useState<utf8_t>('');

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
		run(async ()=>{
			await addServer(token,gid,uri);
			setFormGid('');
			setFormUri('');
			await refresh();
		});
	}

	function onEdit(server:ServerEntry):void{
		setFormGid(server.gid);
		setFormUri(server.uri);
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

			<section>
				<h2>Servers</h2>
				<button
					type="button"
					disabled={busy}
					onClick={()=>{
						run(refresh);
					}}
				>
					Refresh
				</button>
				{0 === servers.length
					? <p className="muted">No servers known.</p>
					: <table>
						<thead>
							<tr><th>GID</th><th>URI</th><th></th></tr>
						</thead>
						<tbody>
							{servers.map((server)=>{
								return (
									<tr key={server.gid}>
										<td><code>{server.gid}</code></td>
										<td>
											<a
												href={server.uri}
												target="_blank"
												rel="noreferrer"
											>
												{server.uri}
											</a>
										</td>
										<td>
											<button
												type="button"
												disabled={busy}
												onClick={()=>{
													onEdit(server);
												}}
											>
												Edit
											</button>
											<button
												type="button"
												disabled={!canWrite}
												onClick={()=>{
													onDelete(server);
												}}
											>
												Delete
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>}
			</section>

			<section>
				<h2>Add or replace server</h2>
				<form onSubmit={onSubmit}>
					<input
						required
						placeholder="GID"
						value={formGid}
						onChange={(event)=>{
							setFormGid(event.target.value);
						}}
					/>
					<input
						required
						type="url"
						placeholder="https://registry.example.org/"
						value={formUri}
						onChange={(event)=>{
							setFormUri(event.target.value);
						}}
					/>
					<button type="submit" disabled={!canWrite}>Save</button>
				</form>
			</section>
		</>
	);
}
