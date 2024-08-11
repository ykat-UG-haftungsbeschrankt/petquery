const express = require('express');
const app = express();
const fs = require("fs");
const util = require("util");
const config = require("./config.js");
const modules = [];

function loadModules(){
	let dirent;
	const dir = fs.opendirSync('./modules');
	while((dirent = dir.readSync()) !== null){
		if(fs.existsSync('./modules/'+dirent.name+'/index.js')){
			console.log('Loading module '+dirent.name);
			let module = require('./modules/'+dirent.name+'/index.js');
			modules.push(new module(
				  config.module
				? config.module[dirent.name]
				: undefined
			));
		}
	}
	dir.closeSync();
}
loadModules();

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.all('/',async function(req,res){
	let query = {...req.query,...req.body};
	let results = [];
	let errors_html = [];
	let results_html = [];

	if(query.query){
		for(module of modules){
			results.push(module.query(query));
		}

		results = await Promise.all(results.map(p => p.catch(e => e)));

		for(result of results.filter(result => (result instanceof Error))){
			errors_html.push('<pre>'+util.inspect(result)+'</pre>');
		}

		for(result of results.filter(result => !(result instanceof Error))){
			for(row of result){
				results_html.push('<pre>'+JSON.stringify(row,null,4)+'</pre>');
			}
		}
	}

	errors_html = errors_html.join('');
	results_html = results_html.join('');

	res.end(`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8">
				<title>Pet Query</title>

				<meta name="viewport" content="width=device-width, initial-scale=1">
				<style>
					body{
						font-family: 'Helvetica', 'Arial', sans-serif;
					}
					h1,form{
						text-align:center;
					}
					pre{
						border: 1px solid #d2d2d2;
						padding: 3px 7px;
						background-color: #f9f9f9;
					}
				</style>
			</head>
			<body>
				<h1>Pet Query</h1>

				<form method="POST">
					<input type="text" id="site-search" name="query" placeholder="Enter identification number
" required/>
					<input type="submit" value="Search">
				</form>
				<h2>Errors:</h2>
				<div class=errors>
					${errors_html}
				</div>
				<h2>Results:</h2>
				<div class=results>
					${results_html}
				</div>
			</body>
		</html>
	`);
});

app.post('/search',function(req,res){
   res.end(JSON.stringify({a:1}));
});

app.listen(config.port,function(){
   console.log(`Express App running at http://127.0.0.1:${config.port}/`);
});