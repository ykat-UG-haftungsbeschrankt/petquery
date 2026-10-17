export class PetQueryAbortController{
	protected readonly _abortController:AbortController;
	protected readonly _abortControllerSet:Set<AbortController>;
	constructor(){
		this._abortController = new AbortController();
		this._abortControllerSet = new Set<AbortController>();
	}
	abort():void{
		this._abortController.abort();
		for(const abortController of this._abortControllerSet){
			abortController.abort();
		}
	}
	isAborted(): boolean{
		return this._abortController.signal.aborted;
	}
	add(abortController: AbortController):void{
		this._abortControllerSet.add(abortController);
	}
	remove(abortController: AbortController):void{
		this._abortControllerSet.delete(abortController);
	}
	private _getTimeoutSignalCallback(abortController: AbortController){
		this.remove(abortController);
		abortController.abort();
	}
	getTimeoutSignal(timeout: milliseconds_t): AbortSignal{
		const abortController = new AbortController();
		const signal = abortController.signal;
		this.add(abortController);
		setTimeout(
			 this._getTimeoutSignalCallback.bind(this, abortController)
			,timeout
		);
		return signal;
	}
};