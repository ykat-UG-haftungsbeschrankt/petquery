[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ykat-UG-haftungsbeschrankt/petquery)](https://github.com/ykat-UG-haftungsbeschrankt/petquery)

<!--
[![GitHub](https://img.shields.io/github/license/jothepro/doxygen-awesome-css)](https://github.com/jothepro/doxygen-awesome-css/blob/main/LICENSE)
![GitHub Repo stars](https://img.shields.io/github/stars/jothepro/doxygen-awesome-css)
-->



Documentation
============

Once a pet is lost, most national authorities will only query national and local associations who register owner information about pets.

So petquery is a pretty simple plugin based meta query search engine for travelers.


🔗 <img src=https://github.com/favicon.ico width=16 height=16> [Repository](https://github.com/ykat-UG-haftungsbeschrankt/petquery)

Examples
------------

### https://petquery.org?bearer=c815512c071af26c864e6af29c2e2080 ###

If enabled in PetQueryConfig.route["/"] a small html page with search field to query all modules.

### https://petquery.org?bearer=c815512c071af26c864e6af29c2e2080&iframe=true&query=112093400000465 ###

If enabled in PetQueryConfig.route["/"] a small html page to embed in an iframe.

### https://petquery.org/json ###

If enabled in PetQueryConfig.route.json to render results in existing websites

```JS
(async function(){
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
```

```PHP
#!/usr/bin/php
<?php

$result = file_get_contents(
	'https://petquery.org/json'
	,false
	,stream_context_create(array(
		"ssl" => array(
			"verify_peer" => FALSE,
			"verify_peer_name" => FALSE,
		),
		'http' => array(
			'method'  => 'POST',
			'header'  => "Content-Type: application/json\r\nAuthorization: Bearer 75258ce9e0a7e751ce4e78cf20dd3f8f\r\n",
			'content' => json_encode(array(
				'query' => '112093400000465'
			))
		)
	))
);

print_r($result);
```

### https://petquery.org/api ###

If enabled in PetQueryConfig.route.api it only returns results from a single module ./module/(PetQueryConfig.route.api.module)/index.js.

So if you are running petquery on your server and implemented a module to add your local database data to the result set, the api uri can make this data available to other authorities by simply extending the petquery module and specify unique uri and authorization credentials in PetQueryConfig for the new module.

```JS
(async function(){
	let data = await fetch("https://petquery.org/api",{
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
```