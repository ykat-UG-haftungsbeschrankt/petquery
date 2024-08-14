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