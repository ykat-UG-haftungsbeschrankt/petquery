/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import {useCallback, useEffect, useState} from 'react';
import type {FormEvent, ReactElement} from 'react';
import {
	createPet,
	deletePet,
	listPets,
	updatePet
} from './api';
import type {PetRecord} from './api';
import {useAction} from './action';

const EMPTY_PET:PetRecord = {
	pet_id:'',
	name:'',
	species:'',
	owner_contact:'',
	notes:'',
	files:[]
};

export function Pets(props:{token:utf8_t}):ReactElement{
	const {busy,error,run} = useAction();
	const [pets,setPets] = useState<Array<PetRecord>>([]);
	const [editing,setEditing] = useState<utf8_t|null>(null);
	const [form,setForm] = useState<PetRecord>(structuredClone(EMPTY_PET));
	const [filesText,setFilesText] = useState<utf8_t>('');

	const refresh = useCallback(async ():Promise<void>=>{
		setPets(await listPets(props.token));
	},[props.token]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	function resetForm():void{
		setEditing(null);
		setForm(structuredClone(EMPTY_PET));
		setFilesText('');
	}

	function editPet(pet:PetRecord):void{
		setEditing(pet.pet_id);
		setForm(structuredClone(pet));
		setFilesText(pet.files.join('\n'));
	}

	function setField(
		field:'pet_id'|'name'|'species'|'owner_contact'|'notes',
		value:utf8_t
	):void{
		setForm((current)=>{
			return {...current,[field]:value};
		});
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const values:PetRecord = {
			...form,
			pet_id:form.pet_id.trim(),
			name:form.name.trim(),
			species:form.species.trim(),
			owner_contact:form.owner_contact.trim(),
			notes:form.notes.trim(),
			files:filesText.split('\n')
				.map((value)=>{
					return value.trim();
				})
				.filter((value)=>{
					return '' !== value;
				})
		};
		run(async ()=>{
			if(null === editing){
				await createPet(props.token,values);
			}else{
				await updatePet(props.token,editing,values);
			}
			resetForm();
			await refresh();
		});
	}

	function onDelete(pet:PetRecord):void{
		if(!window.confirm(`Delete pet ${pet.pet_id}?`)){
			return;
		}
		run(async ()=>{
			await deletePet(props.token,pet.pet_id);
			if(editing === pet.pet_id){
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
						<h2>Pets</h2>
						<p className="muted">
							Manage the local pet JSON database.
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
				{0 === pets.length
					? <p className="muted">No pets found.</p>
					: <table>
						<thead>
							<tr>
								<th>Pet ID</th>
								<th>Name</th>
								<th>Species</th>
								<th>Owner contact</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{pets.map((pet)=>{
								return (
									<tr key={pet.pet_id}>
										<td><code>{pet.pet_id}</code></td>
										<td>{pet.name}</td>
										<td>{pet.species}</td>
										<td>{pet.owner_contact}</td>
										<td>
											<button
												type="button"
												disabled={busy}
												onClick={()=>{
													editPet(pet);
												}}
											>
												Edit
											</button>
											<button
												type="button"
												disabled={busy}
												onClick={()=>{
													onDelete(pet);
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
				<h2>{null === editing ? 'Add pet' : 'Edit pet'}</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>Pet ID</span>
						<input
							required
							disabled={null !== editing}
							value={form.pet_id}
							onChange={(event)=>{
								setField('pet_id',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Name</span>
						<input
							required
							value={form.name}
							onChange={(event)=>{
								setField('name',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Species</span>
						<input
							required
							value={form.species}
							onChange={(event)=>{
								setField('species',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>Owner contact</span>
						<input
							required
							value={form.owner_contact}
							onChange={(event)=>{
								setField(
									'owner_contact',
									event.target.value
								);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Notes</span>
						<textarea
							required
							value={form.notes}
							onChange={(event)=>{
								setField('notes',event.target.value);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Files (one URI per line)</span>
						<textarea
							value={filesText}
							onChange={(event)=>{
								setFilesText(event.target.value);
							}}
						/>
					</label>
					<button type="submit" disabled={busy}>
						{null === editing ? 'Create pet' : 'Save pet'}
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
		</>
	);
}
