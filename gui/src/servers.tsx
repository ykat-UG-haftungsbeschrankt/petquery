/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useCallback, useEffect, useState} from 'react';
import type {FormEvent, ReactElement} from 'react';
import {addServer, deleteServer, listServers, ping} from './api';
import type {ServerEntry} from './api';
import {useAction} from './action';

export function Servers(props:{token:utf8_t}):ReactElement{
	const token = props.token;
	const {busy,error,run} = useAction();
	const [ownUid,setOwnUid] = useState<uuid_t|null>(null);
	const [servers,setServers] = useState<Array<ServerEntry>>([]);
	const [formUid,setFormUid] = useState<utf8_t>('');
	const [formUri,setFormUri] = useState<utf8_t>('');

	const refresh = useCallback(async ():Promise<void>=>{
		const [uid,list] = await Promise.all([ping(),listServers()]);
		setOwnUid(uid);
		setServers(list);
	},[]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const uid = formUid.trim();
		const uri = formUri.trim();
		run(async ()=>{
			await addServer(token,uid,uri);
			setFormUid('');
			setFormUri('');
			await refresh();
		});
	}

	function onEdit(server:ServerEntry):void{
		setFormUid(server.uid);
		setFormUri(server.uri);
	}

	function onDelete(server:ServerEntry):void{
		if(!window.confirm(`Delete server ${server.uid}?`)){
			return;
		}
		run(async ()=>{
			await deleteServer(token,server.uid);
			await refresh();
		});
	}

	const canWrite = !busy && '' !== token;

	return (
		<>
			<p className="muted">
				This server: <code>{ownUid ?? '…'}</code>
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
							<tr><th>UID</th><th>URI</th><th></th></tr>
						</thead>
						<tbody>
							{servers.map((server)=>{
								return (
									<tr key={server.uid}>
										<td><code>{server.uid}</code></td>
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
						placeholder="UID"
						value={formUid}
						onChange={(event)=>{
							setFormUid(event.target.value);
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
