const express = require('express');
const https = require("https");
const util = require("util");
const PetQueryConfig = require("./PetQueryConfig.js");
const PetQueryLib = require("./PetQueryLib.js");
const PetQueryModules = require("./PetQueryModules.js")(PetQueryConfig);
const app = express();

app.use(express.json());
app.use(express.urlencoded());

if(PetQueryConfig.route.json?.enabled === true){
	app.all('/json'
		,PetQueryConfig.route.json?.authenticate
		? PetQueryConfig.route.json.authenticate
		: PetQueryLib.next
		,async function(req,res){
			try{
				res.json(await PetQueryModules.query({...req.query,...req.body}));
			}catch(e){
				res.status(500).send(util.inspect(e));
			}
		}
	);
}

if(PetQueryConfig.route.api?.enabled === true
&& PetQueryConfig.route.api?.module){
	app.all(
		'/api'
		,PetQueryConfig.route.api?.authenticate
		? PetQueryConfig.route.api.authenticate
		: PetQueryLib.next
		,async function(req,res){
			try{
				res.json(
					await PetQueryModules.queryModule(
						 PetQueryConfig.route.api.module
						,{...req.query,...req.body}
					)
				);
			}catch(e){
				res.status(500).send(util.inspect(e));
			}
		}
	);
}

if(PetQueryConfig.route['/']?.enabled === true){
app.all('/',async function(req,res){
	let query = {...req.query,...req.body};
	let data = await PetQueryModules.query(query);

	let errors_html = [];
	let results_html = [];

	try{
			for(const obj of data.error){
				errors_html.push('<pre>'+PetQueryLib.escapeHtml(util.inspect(obj))+'</pre>');
			}

			for(const obj of data.data){
				results_html.push(
					'<div class=result>'
						+(
							obj.preview
							? '<img src="'+PetQueryLib.escapeHtmlAttribute(obj.preview)+'" class=preview>'
							: ''
						)
						+'<a '+(
							obj.source?.url
							? 'href="'+PetQueryLib.escapeHtmlAttribute(obj.source.url)+'"'
							: ''
						)+' target=_blank class=source>'
							+(
								obj.source?.favicon
								? '<img src="'+PetQueryLib.escapeHtmlAttribute(obj.source.favicon)+'" class=favicon> '
								: ''
							)
							+PetQueryLib.escapeHtml(obj.source?.name || '')
						+'</a>'
						+'<table class=data>'
							+PetQueryLib.objectMap(obj.data,(key,value)=>{
								return '<tr><th>'+PetQueryLib.escapeHtml(key)+'</th>'
									 + '<td>'
								     + (
										  PetQueryLib.isArray(value) || PetQueryLib.isObject(value)
										? '<pre>'+PetQueryLib.escapeHtml(JSON.stringify(value,null,4))+'</pre>'
										: PetQueryLib.escapeHtml(value)
									 )
								     + '</td>'
								;
							}).join('')
						+'</table>'
						+(
							obj.files?.length
							? '<div class=files><ul>'
								+obj.files.map(v=>{
									return '<li><a href="'+PetQueryLib.escapeHtmlAttribute(v)+'" target=_blank>'+PetQueryLib.escapeHtml(v)+'</a>';
								})
							+'</div>'
							: ''
						)
					+'</div>'
				);
			}
	}catch(e){
		errors_html.push('<pre>'+PetQueryLib.escapeHtml(util.inspect(e))+'</pre>');
	}

	errors_html = errors_html.join('');
	results_html = results_html.slice(0,PetQueryConfig.max_results_total).join('');

	if(errors_html != ''){
		errors_html = `
			<hr class=lynx>
			<h2>Errors:</h2>
			<div class=errors>
				${errors_html}
			</div>
		`;
	}

	if(results_html != ''){
		results_html = `
			<hr class=lynx>
			<h2>Results:</h2>
			<div class=results>
				${results_html}
			</div>
		`;
	}

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
					a{
						text-decoration:none;
					}
					h1,form{
						text-align:center;
					}
					.results .preview{
						max-width:150px;
						max-height:150px;
						float:left;
						margin: 7px;
						border-radius: 7px;
						margin-bottom: 14px;
					}
					.results .result{
						min-height:160px;
						border: 1px solid #d2d2d2;
						background-color: #f9f9f9;
						border-radius: 7px;
						margin-bottom: 14px;
					}
					.results .data{
						margin-top: 7px;
					}
					.results .data th{
						text-align:left;
						white-space:nowrap;
					}
					.results .source{
					    float: right;
						background-color: white;
						border-bottom: 1px solid #d2d2d2;
						border-left: 1px solid #d2d2d2;
						padding: 1px 3px;
						left: 1px;
						position: relative;
						top: -1px;
						border-bottom-left-radius: 7px;
					}
					.errors pre,.results pre{
						padding: 3px 7px;
					}
					.results pre{
						margin-left: 160px;
					}
					.results .files{
						margin-left: 160px;
					}
					.example_id{
						color:#666;
						font-size:0.7 em;
					}
					.lynx{
						display:none;
					}
				</style>
			</head>
			<body>
				<h1>Pet Query</h1>

				<form method=post>
					<input type="text" name="query" placeholder="Enter identification number
" required/>
					<input type="submit" value="Search">
					<br><br>
					<div class=example_id>Example identification number: 112093400000465</div>
				</form>

				${errors_html}
				${results_html}
			</body>
		</html>
	`);
});
}

if(PetQueryConfig.http.enabled){
	app.listen(PetQueryConfig.http.port,function(){
		console.log(`Express App running at http://127.0.0.1:${PetQueryConfig.http.port}/`);
	});
}

if(PetQueryConfig.https.enabled){
	https
		.createServer(PetQueryConfig.https.certificate)
		.listen(PetQueryConfig.https.port,function(){
			console.log(`Express App running at https://127.0.0.1:${PetQueryConfig.https.port}/`);
		})
	;
}

