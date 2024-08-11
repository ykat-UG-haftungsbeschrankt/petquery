const express = require('express');
const fs = require("fs");
const util = require("util");
const config = require("./config.js");

function escapeHtml(str){
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	
	return str.replace(/[&<>"']/g,function(m){return map[m];});
}

function escapeHtmlAttribute(str){
	const map = {
		'&': '&amp;',
		'"': '&quot;',
		"'": '&#039;'
	};
	
	return str.replace(/[&"']/g,function(m){return map[m];});
}

function loadModules(){
	let modules = [];
	let dirent;

	const dir = fs.opendirSync('./modules');
	while((dirent = dir.readSync()) !== null){
		if(fs.existsSync('./modules/'+dirent.name+'/index.js')
		&& config.module[dirent.name]?.enabled !== false){
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

	return modules;
}

function objectMap(obj,fn){
	let ret = [];
	Object.keys(obj).forEach(function(key){
		ret.push(fn(key,obj[key]));
	});
	return ret;
}

function isArray(a) {
    return (!!a) && (a.constructor === Array);
}

function isObject(a){
    return (!!a) && (a.constructor === Object);
}

const modules = loadModules();
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.all('/',async function(req,res){
	let query = {...req.query,...req.body};
	let results = [];
	let errors_html = [];
	let results_html = [];

	try{

	if(query.query){
		for(module of modules){
			results.push(module.query(query));
		}

		results = await Promise.all(results.map(p => p.catch(e => e)));

		for(const result of results.filter(result => (result instanceof Error))){
			errors_html.push('<pre>'+escapeHtml(util.inspect(result))+'</pre>');
		}

		for(const result of results.filter(result => !(result instanceof Error))){
			for(row of result.slice(0,config.max_results_per_module)){
				results_html.push(
					'<div class=result>'
						+(
							row.preview
							? '<img src="'+escapeHtmlAttribute(row.preview)+'" class=preview>'
							: ''
						)
						+'<a '+(
							row.source?.url
							? 'href="'+escapeHtmlAttribute(row.source.url)+'"'
							: ''
						)+' target=_blank class=source>'
							+(
								row.source?.favicon
								? '<img src="'+escapeHtmlAttribute(row.source.favicon)+'" class=favicon> '
								: ''
							)
							+escapeHtml(row.source?.name || '')
						+'</a>'
						+'<table class=data>'
							+objectMap(row.data,(key,value)=>{
								return '<tr><th>'+escapeHtml(key)+'</th>'
									 + '<td>'
								     + (
										  isArray(value) || isObject(value)
										? '<pre>'+escapeHtml(JSON.stringify(value,null,4))+'</pre>'
										: escapeHtml(value)
									 )
								     + '</td>'
								;
							}).join('')
						+'</table>'
						+(
							row.files?.length
							? '<div class=files><ul>'
								+row.files.map(v=>{
									return '<li><a href="'+escapeHtmlAttribute(v)+'" target=_blank>'+escapeHtml(v)+'</a>';
								})
							+'</div>'
							: ''
						)
					+'</div>'
				);
			}
		}
	}

	}catch(e){
		errors_html.push('<pre>'+escapeHtml(util.inspect(e))+'</pre>');
	}

	errors_html = errors_html.join('');
	results_html = results_html.slice(0,config.max_results_total).join('');

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

app.listen(config.port,function(){
   console.log(`Express App running at http://127.0.0.1:${config.port}/`);
});