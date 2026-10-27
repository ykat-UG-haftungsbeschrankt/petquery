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
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { ChangeEvent } from 'react';
import type { DataTableColumn } from '#gui/data-table';
import type { FormEvent } from 'react';
import type { PetRecord } from '@petquery/api-client';
import type { ReactElement } from 'react';

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

async function readImage(file:File):Promise<PetImageAttachment>{
	if(!IMAGE_MIME_TYPES.has(file.type.toLowerCase())){
		throw new Error('Choose a PNG, JPEG, GIF, WebP, AVIF, or BMP image.');
	}
	return new Promise((resolve,reject)=>{
		const reader = new FileReader();
		reader.onload = ()=>{
			if('string' !== typeof reader.result){
				reject(new Error(`Could not read image "${file.name}"`));
				return;
			}
			resolve({name:file.name,uri:reader.result});
		};
		reader.onerror = ()=>{
			reject(reader.error ?? new Error(
				`Could not read image "${file.name}"`
			));
		};
		reader.readAsDataURL(file);
	});
}

export function Pets(props:{token:utf8_t}):ReactElement{
	const {busy,error,run} = useAction();
	const [pets,setPets] = useState<Array<PetRecord>>([]);
	const [editing,setEditing] = useState<utf8_t|null>(null);
	const [form,setForm] = useState<PetRecord>(structuredClone(EMPTY_PET));
	const [filesText,setFilesText] = useState<utf8_t>('');
	const [uploadedImages,setUploadedImages] =
		useState<Array<PetImageAttachment>>([]);
	const [previewImageName,setPreviewImageName] =
		useState<utf8_t|null>(null);

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
		setUploadedImages([]);
		setPreviewImageName(null);
	}

	function editPet(pet:PetRecord):void{
		setEditing(pet.gid);
		setForm(structuredClone(pet));
		const images = pet.files.filter(isDataImageUri);
		const urls = pet.files.filter((file)=>{
			return !isDataImageUri(file);
		});
		setUploadedImages(images.map((uri,index)=>{
			return {name:`Saved image ${index + 1}`,uri};
		}));
		setFilesText(urls.join('\n'));
		setPreviewImageName(
			isDataImageUri(pet.preview) ? 'Saved preview image' : null
		);
	}

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
			const image = await readImage(file);
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
				images.push(await readImage(file));
			}
			setUploadedImages((current)=>{
				return [...current,...images];
			});
		});
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		const fileUrls = filesText.split('\n')
			.map((value)=>{
				return value.trim();
			})
			.filter((value)=>{
				return '' !== value;
			});
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
			files:[...fileUrls,...imageUris]
		};
		run(async ()=>{
			if(fileUrls.some(isDataImageUri)
			|| (isDataImageUri(values.preview)
				&& null === previewImageName)){
				throw new Error(
					'Use an image upload control instead of pasting a data URI.'
				);
			}
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
		if(!window.confirm(`Delete pet ${pet.gid}?`)){
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
						<h2>Pets</h2>
						<p className="muted">
							Manage the local pet JSON database.
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
								Edit
							</Framework7Button>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									onDelete(pet);
								}}
							>
								Delete
							</Framework7Button>
						</>
					)}
				/>
			</Panel>

			<Panel>
				<h2>{null === editing ? 'Add pet' : 'Edit pet'}</h2>
				<form onSubmit={onSubmit}>
					<label className="field">
						<span>Pet GID</span>
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
						<span>Name</span>
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
						<span>Species</span>
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
						<span>Owner contact</span>
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
						<span>Notes</span>
						<textarea
							maxLength={65536}
							value={form.notes}
							onChange={(event)=>{
								setField('notes',event.target.value);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Preview URL</span>
						<input
							value={
								isDataImageUri(form.preview)
									? ''
									: form.preview
							}
							onChange={(event)=>{
								setField('preview',event.target.value);
								setPreviewImageName(null);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Upload preview image</span>
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
								alt="Pet preview"
							/>
							<Framework7Button
								type="button"
								disabled={busy}
								onClick={()=>{
									setField('preview','');
									setPreviewImageName(null);
								}}
							>
								Remove preview image
							</Framework7Button>
						</div>
					)}
					{SOURCE_FIELDS.map((field)=>{
						return (
							<label className="field" key={field}>
								<span>Source {field}</span>
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
						<legend>Attributes</legend>
						{form.attributes.map((attribute,index)=>{
							return (
								<div className="row" key={index}>
									<input
										aria-label={`Attribute ${index + 1} key`}
										value={attribute.key}
										onChange={(event)=>{
											const value = event.target.value;
											setAttribute(index,'key',value);
										}}
									/>
									<input
										aria-label={`Attribute ${index + 1} value`}
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
										Remove
									</Framework7Button>
								</div>
							);
						})}
						<Framework7Button
							type="button"
							disabled={busy}
							onClick={addAttribute}
						>
							Add attribute
						</Framework7Button>
					</fieldset>
					<label className="field field-wide">
						<span>Attachment URLs (one per line)</span>
						<textarea
							value={filesText}
							onChange={(event)=>{
								setFilesText(event.target.value);
							}}
						/>
					</label>
					<label className="field field-wide">
						<span>Upload attachment images</span>
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
											Remove image
										</Framework7Button>
									</li>
								);
							})}
						</ul>
					)}
					<Framework7Button type="submit" disabled={busy} fill>
						{null === editing ? 'Create pet' : 'Save pet'}
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
		</>
	);
}
