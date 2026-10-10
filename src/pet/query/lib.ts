export class PetQueryLib{
	static escapeHtml(str:unknown):string{
		const map:Record<string,string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		
		return String(str).replace(
			/[&<>"']/g,
			function(m:string):string{return map[m];}
		);
	}

	static escapeHtmlAttribute(str:unknown):string{
		const map:Record<string,string> = {
			'&': '&amp;',
			'"': '&quot;',
			"'": '&#039;'
		};
		
		return String(str).replace(
			/[&"']/g,
			function(m:string):string{return map[m];}
		);
	}

	static objectMap(
		obj:Record<string,unknown>,
		fn:(key:string,value:unknown)=>unknown
	):unknown[]{
		const ret:unknown[] = [];
		Object.keys(obj).forEach(function(key:string){
			ret.push(fn(key,obj[key]));
		});
		return ret;
	}

	static next(
		req:unknown,
		res:unknown,
		next:()=>void
	):void{
		return next();
	}
};