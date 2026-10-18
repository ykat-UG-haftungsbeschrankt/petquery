/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {ChangeEvent, FormEvent, ReactElement} from 'react';
import {
	createUser,
	deleteUser,
	listUsers,
	updateUser
} from './api';
import type {AuthProvider, ManagedUser} from './api';
import {useAction} from './action';

type UserGroup = 'admin'|'user';

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
			<section>
				<div className="page-heading">
					<div>
						<h2>Users</h2>
						<p className="muted">
							Manage local users and review external identities.
						</p>
					</div>
					<button
						type="button"
						disabled={busy}
						onClick={()=>{
							run(refresh);
						}}
					>
						Refresh
					</button>
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
				{0 === users.length
					? <p className="muted">No users found.</p>
					: <table>
						<thead>
							<tr>
								<th>Username</th>
								<th>Name</th>
								<th>Group</th>
								<th>Provider</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{users.map((user)=>{
								return (
									<tr key={`${user.provider}:${user.username}`}>
										<td><code>{user.username}</code></td>
										<td>{user.displayName}</td>
										<td>{user.group}</td>
										<td>{user.provider}</td>
										<td>
											<button
												type="button"
												disabled={
													busy
													|| provider !== user.provider
												}
												onClick={()=>{
													editUser(user);
												}}
											>
												Edit
											</button>
											<button
												type="button"
												disabled={
													busy
													|| provider !== user.provider
												}
												onClick={()=>{
													onDelete(user);
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

			{canManageUsers
				? <section>
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
					<button type="submit" disabled={busy}>
						{null === editing ? 'Create user' : 'Save user'}
					</button>
					{null !== editing && (
						<button
							type="button"
							disabled={busy}
							onClick={resetForm}
						>
							Cancel
						</button>
					)}
				</form>
				</section>
				: <div className="banner">
					No enabled provider supports user management.
				</div>}
		</>
	);
}
