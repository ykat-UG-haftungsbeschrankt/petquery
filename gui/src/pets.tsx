/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button as Framework7Button } from 'framework7-react';
import { createPet } from '@petquery/api-client';
import { DataTable } from '#gui/data-table';
import { deletePet } from '@petquery/api-client';
import { listPets } from '@petquery/api-client';
import { Panel } from '#gui/panel';
import { updatePet } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useI18n } from '#gui/i18n';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { ChangeEvent } from 'react';
import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { PetRecord } from '@petquery/api-client';
import type { ReactElement } from 'react';
import type { Translate } from '#gui/i18n';

type PetImageAttachment = {
	name:utf8_t;
	uri:uri_t;
};

const EMPTY_PET:PetRecord = {
	gid:'',
	name:'',
	species:'',
	owner_contact:'',
	notes:'',
	source:{favicon:'',url:'',name:''},
	preview:'',
	attributes:[],
	files:[]
};
const SOURCE_FIELDS:Array<keyof PetRecord['source']> = [
	'favicon','url','name'
];
const IMAGE_MIME_TYPES = new Set<utf8_t>([
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'image/avif',
	'image/bmp'
]);
const IMAGE_ACCEPT = Array.from(IMAGE_MIME_TYPES).join(',');
const PET_COLUMNS:Array<DataTableColumn<PetRecord>> = [
	{
		key:'gid',
		label:'Pet GID',
		value:(pet)=>pet.gid,
		render:(pet)=><code>{pet.gid}</code>
	},
	{key:'name',label:'Name',value:(pet)=>pet.name},
	{key:'species',label:'Species',value:(pet)=>pet.species},
	{
		key:'owner_contact',
		label:'Owner contact',
		value:(pet)=>pet.owner_contact
	}
];

function isDataImageUri(uri:utf8_t):bool_t{
	return uri.toLowerCase().startsWith('data:image/');
}

async function readImage(
	file:File,
	t:Translate
):Promise<PetImageAttachment>{
	if(!IMAGE_MIME_TYPES.has(file.type.toLowerCase())){
		throw new Error(t(
			'Choose a PNG, JPEG, GIF, WebP, AVIF, or BMP image.'
		));
	}
	return new Promise((resolve,reject)=>{
		const reader = new FileReader();
		reader.onload = ()=>{
			if('string' !== typeof reader.result){
				reject(new Error(t('Could not read image "{name}"',{
					name:file.name
				})));
				return;
			}
			resolve({name:file.name,uri:reader.result});
		};
		reader.onerror = ()=>{
			reject(reader.error ?? new Error(t(
				'Could not read image "{name}"',
				{name:file.name}
			)));
		};
		reader.readAsDataURL(file);
	});
}

export function Pets(props:{token:utf8_t}):ReactElement{
	const {t} = useI18n();
	const {busy,error,run} = useAction();
	const [pets,setPets] = useState<Array<PetRecord>>([]);
	const [editing,setEditing] = useState<utf8_t|null>(null);
	const [form,setForm] = useState<PetRecord>(structuredClone(EMPTY_PET));
	const [uploadedImages,setUploadedImages] =
		useState<Array<PetImageAttachment>>([]);
	const [previewImageName,setPreviewImageName] =
		useState<utf8_t|null>(null);
	const [pendingEdit,setPendingEdit] = useState<utf8_t|null>(()=>{
		return new URLSearchParams(window.location.search).get('edit');
	});

	const refresh = useCallback(async ():Promise<void>=>{
		setPets(await listPets(props.token));
	},[props.token]);

	useEffect(()=>{
		run(refresh);
	},[run,refresh]);

	function resetForm():void{
		setEditing(null);
		setForm(structuredClone(EMPTY_PET));
		setUploadedImages([]);
		setPreviewImageName(null);
	}

	function editPet(pet:PetRecord):void{
		setEditing(pet.gid);
		setForm(structuredClone(pet));
		const images = pet.files.filter(isDataImageUri);
		setUploadedImages(images.map((uri,index)=>{
			return {
				name:t('Saved image {number}',{number:index + 1}),
				uri
			};
		}));
		setPreviewImageName(
			isDataImageUri(pet.preview)
				? t('Saved preview image')
				: null
		);
	}

	useEffect(()=>{
		if(null === pendingEdit){
			return;
		}
		const pet = pets.find((entry)=>{
			return pendingEdit === entry.gid;
		});
		if(undefined === pet){
			return;
		}
		setPendingEdit(null);
		window.history.replaceState(null,'',window.location.pathname);
		editPet(pet);
	},[pets,pendingEdit]);

	function setField(
		field:'gid'|'name'|'species'|'owner_contact'|'notes'|'preview',
		value:utf8_t
	):void{
		setForm((current)=>{
			return {...current,[field]:value};
		});
	}

	function setAttribute(
		index:size_t,
		field:'key'|'value',
		value:utf8_t
	):void{
		setForm((current)=>{
			const attributes = current.attributes.map((attribute,position)=>{
				return position === index
					? {...attribute,[field]:value}
					: attribute;
			});
			return {...current,attributes};
		});
	}

	function addAttribute():void{
		setForm((current)=>{
			return {
				...current,
				attributes:[...current.attributes,{key:'',value:''}]
			};
		});
	}

	function removeAttribute(index:size_t):void{
		setForm((current)=>{
			const attributes = current.attributes.filter((UNUSED_value,i)=>{
				return i !== index;
			});
			return {...current,attributes};
		});
	}

	function onPreviewImageChange(
		event:ChangeEvent<HTMLInputElement>
	):void{
		const input = event.currentTarget;
		const file = input.files?.[0];
		input.value = '';
		if(undefined === file){
			return;
		}
		run(async ()=>{
			const image = await readImage(file,t);
			setField('preview',image.uri);
			setPreviewImageName(image.name);
		});
	}

	function onAttachmentImagesChange(
		event:ChangeEvent<HTMLInputElement>
	):void{
		const input = event.currentTarget;
		const files = Array.from(input.files ?? []);
		input.value = '';
		if(0 === files.length){
			return;
		}
		run(async ()=>{
			const images:Array<PetImageAttachment> = [];
			for(const file of files){
				images.push(await readImage(file,t));
			}
			setUploadedImages((current)=>{
				return [...current,...images];
			});
		});
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const imageUris = uploadedImages.map((image)=>{
			return image.uri;
		});
		const values:PetRecord = {
			...form,
			gid:form.gid.trim(),
			name:form.name.trim(),
			species:form.species.trim(),
			owner_contact:form.owner_contact.trim(),
			notes:form.notes.trim(),
			files:[
				...form.files.filter((file)=>{
					return !isDataImageUri(file);
				}),
				...imageUris
			]
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
		if(!window.confirm(t('Delete pet {gid}?',{gid:pet.gid}))){
			return;
		}
		run(async ()=>{
			await deletePet(props.token,pet.gid);
			if(editing === pet.gid){
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
						<h2>{t('Pets')}</h2>
						<p className="muted">
							{t('Manage the local pet JSON database.')}
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
					rows={pets}
					columns={PET_COLUMNS}
					filterLabel="pets"
					emptyMessage="No pets found."
					rowKey={(pet)=>pet.gid}
					renderActions={(pet)=>(
						<>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									editPet(pet);
								}}
							>
								{t('Edit')}
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									onDelete(pet);
								}}
							>
								{t('Delete')}
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			<Panel>
				<h2>{null === editing ? t('Add pet') : t('Edit pet')}</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>{t('Pet GID')}</span>
						<input
							required
							disabled={null !== editing}
							value={form.gid}
							onChange={(event)=>{
								setField('gid',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>{t('Name')}</span>
						<input
							required
							maxLength={256}
							value={form.name}
							onChange={(event)=>{
								setField('name',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>{t('Species')}</span>
						<input
							required
							maxLength={256}
							value={form.species}
							onChange={(event)=>{
								setField('species',event.target.value);
							}}
						/>
					</label>
					<label className="field">
						<span>{t('Owner contact')}</span>
						<input
							maxLength={4096}
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
						<span>{t('Notes')}</span>
						<textarea
							maxLength={65536}
							value={form.notes}
							onChange={(event)=>{
								setField('notes',event.target.value);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>{t('Upload preview image')}</span>
						<input
							className="file-input"
							type="file"
							accept={IMAGE_ACCEPT}
							disabled={busy}
							onChange={onPreviewImageChange}
						/>
					</label>
					{null !== previewImageName && (
						<div className="selected-files">
							<span>{previewImageName}</span>
							<img
								className="attachment-preview"
								src={form.preview}
								alt={t('Pet preview')}
							/>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									setField('preview','');
									setPreviewImageName(null);
								}}
							>
								{t('Remove preview image')}
							</Framework7Button>
						</div>
					)}
					{SOURCE_FIELDS.map((field)=>{
						return (
							<label className="field" key={field}>
								<span>{t('Source {field}',{field})}</span>
								<input
									value={form.source[field]}
									onChange={(event)=>{
										const value = event.target.value;
										setForm((current)=>{
											return {
												...current,
												source:{
													...current.source,
													[field]:value
												}
											};
										});
									}}
								/>
							</label>
						);
					})}
					<fieldset>
						<legend>{t('Attributes')}</legend>
						{form.attributes.map((attribute,index)=>{
							return (
								<div className="row" key={index}>
									<input
										aria-label={t(
											'Attribute {number} key',
											{number:index + 1}
										)}
										value={attribute.key}
										onChange={(event)=>{
											const value = event.target.value;
											setAttribute(index,'key',value);
										}}
									/>
									<input
										aria-label={t(
											'Attribute {number} value',
											{number:index + 1}
										)}
										value={attribute.value}
										onChange={(event)=>{
											const value = event.target.value;
											setAttribute(index,'value',value);
										}}
									/>
									<Framework7Button
										type="button"
										disabled={busy}
										onClick={()=>{
											removeAttribute(index);
										}}
									>
										{t('Remove')}
									</Framework7Button>
								</div>
							);
						})}
						<Framework7Button
							type="button"
							disabled={busy}
							onClick={addAttribute}
						>
							{t('Add attribute')}
						</Framework7Button>
					</fieldset>
					<label className="field field-wide">
						<span>{t('Upload attachment images')}</span>
						<input
							className="file-input"
							type="file"
							accept={IMAGE_ACCEPT}
							multiple
							disabled={busy}
							onChange={onAttachmentImagesChange}
						/>
					</label>
					{0 < uploadedImages.length && (
						<ul className="selected-files">
							{uploadedImages.map((image,index)=>{
								return (
									<li key={`${image.name}-${index}`}>
										<span>{image.name}</span>
										<img
											className="attachment-preview"
											src={image.uri}
											alt={image.name}
										/>
										<Framework7Button
											type="button"
											disabled={busy}
											onClick={()=>{
												setUploadedImages((current)=>{
													return current.filter(
														(UNUSED_image,position)=>{
															return position !== index;
														}
													);
												});
											}}
										>
											{t('Remove image')}
										</Framework7Button>
									</li>
								);
							})}
						</ul>
					)}
					<Framework7Button type="submit" disabled={busy} fill>
						{null === editing
							? t('Create pet')
							: t('Save pet')}
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
		</>
	);
}
