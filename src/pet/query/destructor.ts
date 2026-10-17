export abstract class PetQueryDestructor{
	private _destructorPromise:Promise<void>|null;

	// Opens the named database inside the LMDB environment at path.
	constructor(){
		this._destructorPromise = null;
	}
	async destructor(){
		if(null === this._destructorPromise){
			try{
				this._destructorPromise = this._destructor();
			}catch(UNUSED_e){
			}
		}
		return this._destructorPromise;
	}
	protected _isDestroyed():boolean{
		return null !== this._destructorPromise;
	}
	protected _assertNotDestroyed():void{
		if(null !== this._destructorPromise){
			throw new Error(this.constructor.name+' is destructed');
		}
	}
	protected abstract _destructor():Promise<void>;
};
