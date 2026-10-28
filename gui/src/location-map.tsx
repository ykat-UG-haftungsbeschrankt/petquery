/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import 'leaflet/dist/leaflet.css';

import { circleMarker } from 'leaflet';
import { map as createMap } from 'leaflet';
import { tileLayer } from 'leaflet';
import { useEffect } from 'react';
import { useRef } from 'react';

import type { CircleMarker } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { ReactElement } from 'react';

const DEFAULT_ZOOM = 15;
const WORLD_ZOOM = 2;

export function LocationMap(props:{
	latitude:float_t|null;
	longitude:float_t|null;
	onChange:(latitude:float_t,longitude:float_t)=>void;
}):ReactElement{
	const container = useRef<HTMLDivElement|null>(null);
	const map = useRef<LeafletMap|null>(null);
	const marker = useRef<CircleMarker|null>(null);
	const onChange = useRef(props.onChange);
	onChange.current = props.onChange;

	useEffect(()=>{
		if(null === container.current){
			return;
		}
		const instance = createMap(container.current).setView(
			[0,0],
			WORLD_ZOOM
		);
		tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
			maxZoom:19,
			// The page sends no referrer, but OSM blocks tile requests
			// without one. Only the origin is sent, and only for tiles.
			referrerPolicy:'strict-origin-when-cross-origin',
			attribution:'&copy; <a href="https://www.openstreetmap.org/'
				+'copyright">OpenStreetMap</a> contributors'
		}).addTo(instance);
		instance.on('click',(event:LeafletMouseEvent)=>{
			onChange.current(
				event.latlng.lat,
				event.latlng.wrap().lng
			);
		});
		map.current = instance;
		return ()=>{
			instance.remove();
			map.current = null;
			marker.current = null;
		};
	},[]);

	useEffect(()=>{
		const instance = map.current;
		if(null === instance){
			return;
		}
		if(null === props.latitude || null === props.longitude
		|| !Number.isFinite(props.latitude)
		|| !Number.isFinite(props.longitude)){
			return;
		}
		const position:[float_t,float_t] = [props.latitude,props.longitude];
		if(null === marker.current){
			marker.current = circleMarker(position,{
				radius:9,
				weight:3,
				color:'#0b5f59',
				fillColor:'#0f766e',
				fillOpacity:.7
			}).addTo(instance);
			instance.setView(position,DEFAULT_ZOOM);
		}else{
			marker.current.setLatLng(position);
			instance.panTo(position);
		}
	},[props.latitude,props.longitude]);

	return (
		<div
			ref={container}
			className="location-map"
			role="application"
			aria-label="Map: click to set the sighting location"
		/>
	);
}
