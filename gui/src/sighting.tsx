/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { Button } from 'framework7-react';
import { LocationMap } from '#gui/location-map';
import { locateViewer } from '#gui/geolocation';
import { reportPetSighting } from '@petquery/api-client';
import { useAction } from '#gui/action';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

import type { FormEvent } from 'react';
import type { PetSighting } from '@petquery/api-client';
import type { ReactElement } from 'react';

export function Sighting(props:{
	gid:utf8_t;
	endpoint:utf8_t;
	onSaved:(sighting:PetSighting)=>void;
	onCancel:()=>void;
}):ReactElement{
	const {busy,error,run} = useAction();
	const [latitude,setLatitude] = useState<utf8_t>('');
	const [longitude,setLongitude] = useState<utf8_t>('');
	const [name,setName] = useState<utf8_t>('');
	const [email,setEmail] = useState<utf8_t>('');
	const [phone,setPhone] = useState<utf8_t>('');

	const onLocate = useCallback(():void=>{
		run(async ()=>{
			const location = await locateViewer();
			setLatitude(`${location.latitude}`);
			setLongitude(`${location.longitude}`);
		});
	},[run]);

	useEffect(()=>{
		onLocate();
	},[onLocate]);

	function onMapChange(newLatitude:float_t,newLongitude:float_t):void{
		setLatitude(`${newLatitude}`);
		setLongitude(`${newLongitude}`);
	}

	function onSubmit(event:FormEvent<HTMLFormElement>):void{
		event.preventDefault();
		run(async ()=>{
			const sighting:PetSighting = {
				timestamp:new Date().toISOString(),
				location:{
					latitude:Number(latitude),
					longitude:Number(longitude)
				},
				contact:{name,email,phone}
			};
			await reportPetSighting(props.endpoint,props.gid,sighting);
			props.onSaved(sighting);
		});
	}

	return (
		<section className="sighting">
			{null !== error && <p className="error" role="alert">{error}</p>}
			<form onSubmit={onSubmit}>
				<p className="muted">
					This publicly updates the pet immediately on{' '}
					<strong>{props.endpoint}</strong>.
					Your contact details will be visible in search results.
				</p>
				<p className="muted">
					The sighting time is set to the moment you save.
				</p>
				<Button type="button" disabled={busy} onClick={onLocate}>
					Refresh my current location
				</Button>
				<LocationMap
					latitude={'' === latitude ? null : Number(latitude)}
					longitude={'' === longitude ? null : Number(longitude)}
					onChange={onMapChange}
				/>
				<p className="muted">
					Your current location is pre-selected. Click the map
					to adjust it.
				</p>
				<label className="field">
					<span>Latitude</span>
					<input
						type="number"
						min="-90"
						max="90"
						step="any"
						required
						value={latitude}
						onChange={(event)=>{
							setLatitude(event.target.value);
						}}
					/>
				</label>
				<label className="field">
					<span>Longitude</span>
					<input
						type="number"
						min="-180"
						max="180"
						step="any"
						required
						value={longitude}
						onChange={(event)=>{
							setLongitude(event.target.value);
						}}
					/>
				</label>
				<label className="field">
					<span>Contact name</span>
					<input required value={name} onChange={(event)=>{
						setName(event.target.value);
					}}/>
				</label>
				<label className="field">
					<span>Contact email</span>
					<input
						type="email"
						required
						value={email}
						onChange={(event)=>{
							setEmail(event.target.value);
						}}
					/>
				</label>
				<label className="field">
					<span>Contact phone</span>
					<input
						type="tel"
						required
						value={phone}
						onChange={(event)=>{
							setPhone(event.target.value);
						}}
					/>
				</label>
				<div className="sighting-actions">
					<Button type="submit" disabled={busy} fill>
						Save public sighting
					</Button>
					<Button
						type="button"
						disabled={busy}
						onClick={props.onCancel}
					>
						Cancel
					</Button>
				</div>
			</form>
		</section>
	);
}
