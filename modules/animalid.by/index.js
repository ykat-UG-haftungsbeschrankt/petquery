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
				"content-type": "application/x-www-form-urlencoded",
			/*
				"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\"",
				"sec-ch-ua-mobile": "?0",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
				"cookie": "_gid=GA1.2.140302929.1723392930; PHPSESSID=95cc62078407474027e03d5bb8540f87; _gat_gtag_UA_98212976_1=1; _ga_0Y81ZP9QY7=GS1.1.1723392930.1.1.1723393534.0.0.0; _ga=GA1.1.1499517509.1723392930"
			*/
			},
			"referrer": "https://animalid.by/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": "id="+query.query.replace(/[^0-9]/g,''),
			"method": "POST",
			"mode": "cors"
		});
		let body = await data.text();
		console.log(body);
		let table = [...body.matchAll(/<tr>[\s\S]*?<td>([\s\S]*?)<\/td>[\s\S]*?<td>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/g)];
		let obj = {};
		for(const row of table){
			obj[row[1].replace(/<[^>]+(>|$)/g, "")] = row[2].replace(/<[^>]+(>|$)/g, "");
		}
		return [obj];
	}
};

module.exports = PetQueryModulesAnimalidBy;


