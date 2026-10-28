/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { PetSighting } from '@petquery/api-client';

export async function locateViewer():Promise<PetSighting['location']>{
	if(!navigator.geolocation){
		throw new Error('Your browser does not support geolocation.');
	}
	return new Promise((resolve,reject)=>{
		navigator.geolocation.getCurrentPosition(
			(position)=>{
				resolve({
					latitude:position.coords.latitude,
					longitude:position.coords.longitude
				});
			},
			(error)=>{
				reject(new Error(`Location unavailable: ${error.message}`));
			},
			{enableHighAccuracy:true,timeout:15000,maximumAge:60000}
		);
	});
}

export function distanceKm(
	from:PetSighting['location'],
	to:PetSighting['location']
):float_t{
	const radians = Math.PI / 180;
	const latitude = (to.latitude - from.latitude) * radians;
	const longitude = (to.longitude - from.longitude) * radians;
	const haversine = Math.sin(latitude / 2) ** 2
		+ Math.cos(from.latitude * radians)
		* Math.cos(to.latitude * radians)
		* Math.sin(longitude / 2) ** 2;
	return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,haversine)));
}
