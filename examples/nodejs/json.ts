/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

(async function():Promise<void>{
	let data = await fetch("https://petquery.org/json",{
		headers:{
			"accept": "application/json"
			,"cache-control": "max-age=0"
			,"content-type": "application/json"
			,"authorization": "Bearer 75258ce9e0a7e751ce4e78cf20dd3f8f"
		}
		,body: JSON.stringify({query:'112093400000465'})
		,method: "POST"
	});
	if(!data.ok){
		throw new Error(data.statusText);
	}
	let json = await data.json();
	console.log(JSON.stringify(json));
})();