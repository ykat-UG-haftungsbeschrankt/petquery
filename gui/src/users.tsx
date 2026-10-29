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
import { useI18n } from '#gui/i18n';
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

function getUserColumns(
	t:(message:utf8_t)=>utf8_t
):Array<DataTableColumn<ManagedUser>>{
	return [
		{
			key:'username',
			label:'Username',
			value:(user)=>user.username,
			render:(user)=><code>{user.username}</code>
		},
		{key:'displayName',label:'Name',value:(user)=>user.displayName},
		{
			key:'group',
			label:'Group',
			value:(user)=>t('admin' === user.group ? 'Admin' : 'User')
		},
		{key:'provider',label:'Provider',value:(user)=>user.provider}
	];
}

export function Users(props:{
	token:utf8_t;
	providers:Array<AuthProvider>;
}):ReactElement{
	const {t} = useI18n();
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
	const columns = getUserColumns(t);

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
		if(!window.confirm(t('Delete user {username}?',{
			username:user.username
		}))){
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
						<h2>{t('Users')}</h2>
						<p className="muted">
							{t(
								'Manage local users and review external '
								+'identities.'
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
				{0 < props.providers.length && (
					<label className="field">
						<span>{t('User management provider')}</span>
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
					columns={columns}
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
								{t('Edit')}
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
								{t('Delete')}
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			{canManageUsers
				? <Panel>
				<h2>
					{null === editing ? t('Add user') : t('Edit user')}
				</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>{t('Username')}</span>
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
						<span>{t('Display name')}</span>
						<input
							required
							value={displayName}
							onChange={(event)=>{
								setDisplayName(event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>{t('Group')}</span>
						<select
							value={group}
							onChange={(event:ChangeEvent<HTMLSelectElement>)=>{
								const value = event.target.value;
								setGroup(
									'admin' === value ? 'admin' : 'user'
								);
							}}
						>
							<option value="user">{t('User')}</option>
							<option value="admin">{t('Admin')}</option>
						</select>
					</label>
					<label className="field">
						<span>{t('Password')}</span>
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
						{null === editing
							? t('Create user')
							: t('Save user')}
					</Framework7Button>
					{null !== editing && (
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
				: <div className="banner">
					{t('No enabled provider supports user management.')}
				</div>}
		</>
	);
}
