/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryTimer{
	protected readonly _interval:milliseconds_t;
	protected readonly _callback:()=>Promise<void>;
	protected readonly _onError:(error:unknown)=>void;
	protected _timer:NodeJS.Timeout|null;
	protected _running:Promise<void>|null;
	protected _destructorPromise:Promise<void>|null;

	constructor(
		interval:milliseconds_t,
		callback:()=>Promise<void>,
		onError:(error:unknown)=>void
	){
		this._interval = interval;
		this._callback = callback;
		this._onError = onError;
		this._timer = null;
		this._running = null;
		this._destructorPromise = null;
	}

	start():void{
		if(null !== this._destructorPromise){
			throw new Error('Timer is destroyed');
		}
		if(null !== this._timer || null !== this._running){
			return;
		}
		this._schedule(0);
	}

	destructor():Promise<void>{
		if(null === this._destructorPromise){
			this._destructorPromise = this._destroy();
		}
		return this._destructorPromise;
	}

	protected async _destroy():Promise<void>{
		try{
			if(null !== this._timer){
				clearTimeout(this._timer);
				this._timer = null;
			}
			if(null !== this._running){
				await this._running;
			}
		}
		catch(UNUSED_e){
		}
	}

	protected _schedule(delay:milliseconds_t):void{
		this._timer = setTimeout(this._onTimer.bind(this),delay);
	}

	protected _onTimer():void{
		this._timer = null;
		this._running = this._callback()
			.catch(this._handleError.bind(this))
			.finally(this._onDone.bind(this));
	}

	protected _handleError(error:unknown):void{
		this._onError(error);
	}

	protected _onDone():void{
		this._running = null;
		if(null === this._destructorPromise){
			this._schedule(this._interval);
		}
	}
};
