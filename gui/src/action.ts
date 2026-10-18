/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { useCallback } from 'react';
import { useState } from 'react';

export type Action = {
	busy:bool_t;
	error:utf8_t|null;
	// Runs action, showing a busy state and reporting its failure in error.
	run:(action:()=>Promise<void>)=>void;
};

export function toMessage(error:unknown):utf8_t{
	return error instanceof Error ? error.message : String(error);
}

export function useAction():Action{
	const [busy,setBusy] = useState<bool_t>(false);
	const [error,setError] = useState<utf8_t|null>(null);

	const run = useCallback((action:()=>Promise<void>):void=>{
		setBusy(true);
		setError(null);
		action().then(
			()=>{
				setBusy(false);
			},
			(reason:unknown)=>{
				setError(toMessage(reason));
				setBusy(false);
			}
		);
	},[]);

	return {busy,error,run};
}
