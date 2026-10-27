/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { createUser } from '@petquery/api-client';
import { DataTable } from '#gui/data-table';
import { deleteUser } from '@petquery/api-client';
import { listUsers } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { updateUser } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';

import type { AuthProvider } from '@petquery/api-client';
import type { ChangeEvent } from 'react';
import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { ManagedUser } from '@petquery/api-client';
import type { ReactElement } from 'react';

type UserGroup = ManagedUser['group'];

const USER_COLUMNS:Array<DataTableColumn<ManagedUser>> = [
	{
		key:'username',
		label:'Username',
		value:(user)=>user.username,
		render:(user)=><code>{user.username}</code>
	},
	{key:'displayName',label:'Name',value:(user)=>user.displayName},
	{key:'group',label:'Group',value:(user)=>user.group},
	{key:'provider',label:'Provider',value:(user)=>user.provider}
];

export function Users(props:{
	token:utf8_t;
	providers:Array<AuthProvider>;
}):ReactElement{
	const {busy,error,run} = useAction();
	const [users,setUsers] = useState<Array<ManagedUser>>([]);
	const [provider,setProvider] = useState<utf8_t>('');
	const [editing,setEditing] = useState<utf8_t|null>(null);
	const [username,setUsername] = useState<utf8_t>('');
	const [displayName,setDisplayName] = useState<utf8_t>('');
	const [group,setGroup] = useState<UserGroup>('user');
	const [password,setPassword] = useState<utf8_t>('');
	const writableProviders = useMemo(()=>{
		return props.providers.filter((entry)=>{
			return entry.userManagement;
		});
	},[props.providers]);
	const canManageUsers = writableProviders.some((entry)=>{
		return entry.name === provider;
	});

	useEffect(()=>{
		if(!props.providers.some((entry)=>{
			return entry.name === provider;
		})){
			setProvider(props.providers[0]?.name ?? '');
		}
	},[provider,props.providers]);

	const refresh = useCallback(async ():Promise<void>=>{
		if(!props.providers.some((entry)=>{
			return entry.name === provider;
		})){
			setUsers([]);
			return;
		}
		setUsers(await listUsers(props.token,provider));
	},[props.token,provider,props.providers]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	function resetForm():void{
		setEditing(null);
		setUsername('');
		setDisplayName('');
		setGroup('user');
		setPassword('');
	}

	function editUser(user:ManagedUser):void{
		setEditing(user.username);
		setUsername(user.username);
		setDisplayName(user.displayName);
		setGroup(user.group);
		setPassword('');
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const values = {
			displayName:displayName.trim(),
			group,
			password
		};
		run(async ()=>{
			if(null === editing){
				await createUser(props.token,{
					username:username.trim(),
					...values
				},provider);
			}else{
				await updateUser(props.token,editing,values,provider);
			}
			resetForm();
			await refresh();
		});
	}

	function onDelete(user:ManagedUser):void{
		if(!window.confirm(`Delete user ${user.username}?`)){
			return;
		}
		run(async ()=>{
			await deleteUser(props.token,user.username,provider);
			if(editing === user.username){
				resetForm();
			}
			await refresh();
		});
	}

	return (
		<>
			{null !== error && <pre className="error">{error}</pre>}
			<Panel>
				<div className="page-heading">
					<div>
						<h2>Users</h2>
						<p className="muted">
							Manage local users and review external identities.
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
				{0 < props.providers.length && (
					<label className="field">
						<span>User management provider</span>
						<select
							value={provider}
							onChange={(event)=>{
								resetForm();
								setProvider(event.target.value);
							}}
						>
							{props.providers.map((entry)=>{
								return (
									<option
										key={entry.name}
										value={entry.name}
									>
										{entry.name}
									</option>
								);
							})}
						</select>
					</label>
				)}
				<DataTable
					rows={users}
					columns={USER_COLUMNS}
					filterLabel="users"
					emptyMessage="No users found."
					rowKey={(user)=>{
						return `${user.provider}:${user.username}`;
					}}
					renderActions={(user)=>(
						<>
							<Framework7Button
								type="button"
								disabled={
									busy || provider !== user.provider
								}
								onClick={()=>{
									editUser(user);
								}}
							>
								Edit
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={
									busy || provider !== user.provider
								}
								onClick={()=>{
									onDelete(user);
								}}
							>
								Delete
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			{canManageUsers
				? <Panel>
				<h2>{null === editing ? 'Add user' : 'Edit user'}</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>Username</span>
						<input
							required
							disabled={null !== editing}
							autoComplete="username"
							value={username}
							onChange={(event)=>{
								setUsername(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Display name</span>
						<input
							required
							value={displayName}
							onChange={(event)=>{
								setDisplayName(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Group</span>
						<select
							value={group}
							onChange={(event:ChangeEvent<HTMLSelectElement>)=>{
								const value = event.target.value;
								setGroup(
									'admin' === value ? 'admin' : 'user'
								);
							}}
						>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					</label>
					<label className="field">
						<span>Password</span>
						<input
							type="password"
							required={null === editing}
							autoComplete="new-password"
							value={password}
							onChange={(event)=>{
								setPassword(event.target.value);
							}}
						/>
					</label>
					<Framework7Button type="submit" disabled={busy} fill>
						{null === editing ? 'Create user' : 'Save user'}
					</Framework7Button>
					{null !== editing && (
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
				: <div className="banner">
					No enabled provider supports user management.
				</div>}
		</>
	);
}
