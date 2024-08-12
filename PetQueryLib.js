class PetQueryLib{
	static escapeHtml(str){
		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		
		return str.replace(/[&<>"']/g,function(m){return map[m];});
	}

	static escapeHtmlAttribute(str){
		const map = {
			'&': '&amp;',
			'"': '&quot;',
			"'": '&#039;'
		};
		
		return str.replace(/[&"']/g,function(m){return map[m];});
	}

	static objectMap(obj,fn){
		let ret = [];
		Object.keys(obj).forEach(function(key){
			ret.push(fn(key,obj[key]));
		});
		return ret;
	}

	static isArray(a) {
		return (!!a) && (a.constructor === Array);
	}

	static isObject(a){
		return (!!a) && (a.constructor === Object);
	}

	static next(req, res, next){
		return next();
	}
}
module.exports = PetQueryLib;