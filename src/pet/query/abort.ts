/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

export class PetQueryAbortController extends PetQueryDestructor{
	protected readonly _abortController:AbortController;
	protected readonly _abortControllerSet:Set<AbortController>;
	constructor(){
		super();
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
	protected _getTimeoutSignalCallback(
		abortController:AbortController
	):void{
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

	async _destructor(){
		this.abort();
		this._abortControllerSet.clear();
	}
};