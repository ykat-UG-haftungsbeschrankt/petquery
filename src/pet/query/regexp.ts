/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

export class PetQueryRegexp {
	static escape(string: string): string {
		return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
	}
}