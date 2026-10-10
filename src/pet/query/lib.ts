export class PetQueryLib{
	protected static readonly _htmlEscapeMap:ReadonlyMap<string,string>
		=new Map([
			['&', '&amp;'],
			['<', '&lt;'],
			['>', '&gt;'],
			['"', '&quot;'],
			["'", '&#039;']
		]);
	protected static readonly _htmlAttributeEscapeMap:
		ReadonlyMap<string,string>=new Map([
			['&', '&amp;'],
			['"', '&quot;'],
			["'", '&#039;']
		]);

	protected static _escapeHtmlCharacter(match:string):string{
		return PetQueryLib._htmlEscapeMap.get(match)
			?? match;
	}

	protected static _escapeHtmlAttributeCharacter(
		match:string
	):string{
		return PetQueryLib._htmlAttributeEscapeMap.get(match)
			?? match;
	}

	static escapeHtml(str:string):string{
		return str.replace(
			/[&<>"']/g,
			PetQueryLib._escapeHtmlCharacter
		);
	}

	static escapeHtmlAttribute(str:string):string{
		return str.replace(
			/[&"']/g,
			PetQueryLib._escapeHtmlAttributeCharacter
		);
	}

	static objectMap<VALUE_T,RETURN_T>(
		obj:Record<string,VALUE_T>,
		fn:(key:string,value:VALUE_T)=>RETURN_T
	):RETURN_T[]{
		const ret:RETURN_T[] = [];
		for(const key of Object.keys(obj)){
			ret.push(fn(key,obj[key]));
		}
		return ret;
	}
};