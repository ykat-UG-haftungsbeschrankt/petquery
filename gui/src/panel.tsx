/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { CardContent } from 'framework7-react';

import type { ReactElement } from 'react';
import type { ReactNode } from 'react';

export function Panel(props:{
	children:ReactNode;
	className?:utf8_t;
}):ReactElement{
	const className = undefined === props.className
		? 'card panel'
		: `card panel ${props.className}`;
	return (
		<section className={className}>
			<CardContent>{props.children}</CardContent>
		</section>
	);
}
