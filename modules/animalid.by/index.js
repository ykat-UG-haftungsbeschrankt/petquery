const PetQueryModule = require('../../module.js');
const FormData = require('form-data');
const request = require('request');

class PetQueryModulesAnimalidBy extends PetQueryModule{
	constructor(cfg){
		super(cfg);
	}
	async query(query){
		let data = await fetch("https://animalid.by/", {
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded"
			},
			"referrer": "https://animalid.by/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": "id="+query.query.replace(/[^0-9]/g,''),
			"method": "POST",
			"mode": "cors"
		});
		let body = await data.text();
		console.log(body);
		let img = body.match(/<td\s+id="img">[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>/);
		let table = [...body.matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td[^>]*>[\s\S]*?<\/tr[^>]*>/g)];
		let obj = {
			source:{
				 favicon:'https://animalid.by/favicon.ico'
				,url:'https://animalid.by'
				,name:'Animalid'
			}
			,preview:'https://animalid.by'+img[1]
			,files:['https://animalid.by'+img[1]]
			,data:{}
		};
		for(const row of table){
			obj.data[row[1].replace(/<[^>]+(>|$)/g, "")] = row[2].replace(/<[^>]+(>|$)/g, "");
		}
		return [obj];
	}
};

module.exports = PetQueryModulesAnimalidBy;


