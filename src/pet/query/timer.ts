/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { PetQueryDestructor } from '#petquery/destructor.js';

export abstract class PetQueryTimer extends PetQueryDestructor{
	protected readonly _interval:milliseconds_t;
	protected _timer:NodeJS.Timeout|null;
	protected _running:Promise<void>|null;

	constructor(
		interval:milliseconds_t
	){
		super();
		this._interval = interval;
		this._timer = null;
		this._running = null;
	}

	protected async _destructor(){
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

	start():void{
		if(this._isDestroyed()){
			throw new Error('Timer is destroyed');
		}
		if(null !== this._timer || null !== this._running){
			return;
		}
		this._schedule(0);
	}

	protected abstract _onCallback():Promise<void>;
	protected abstract _onError(error:unknown):void;

	protected _schedule(delay:milliseconds_t):void{
		this._timer = setTimeout(this._onTimer.bind(this),delay);
	}

	protected _onTimer():void{
		this._timer = null;
		this._running = this._onCallback()
			.catch(this._handleError.bind(this))
			.finally(this._onDone.bind(this));
	}

	protected _handleError(error:unknown):void{
		this._onError(error);
	}

	protected _onDone():void{
		this._running = null;
		if(!this._isDestroyed()){
			this._schedule(this._interval);
		}
	}
};
