/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {ReactElement} from 'react';

const DOCS_URL:utf8_t = '/docs/';
const API_URL:utf8_t = '/openapi/';

export function Docs():ReactElement{
	const base = import.meta.env.BASE_URL;
	const apiSelected = `${base}docs/api` === window.location.pathname;
	const url = apiSelected ? API_URL : DOCS_URL;

	return (
		<section className="docs-page">
			<div className="eyebrow">Reference</div>
			<div className="page-heading">
				<div>
					<h2>Documentation</h2>
					<p className="muted">
						Browse the documentation and HTTP API reference.
					</p>
				</div>
				<a
					className="button-link"
					href={url}
					target="_blank"
					rel="noreferrer"
				>
					Open in new tab
				</a>
			</div>
			<nav className="admin-nav" aria-label="Documentation sections">
				<a
					href={`${base}docs`}
					aria-current={!apiSelected ? 'page' : undefined}
				>
					Documentation
				</a>
				<a
					href={`${base}docs/api`}
					aria-current={apiSelected ? 'page' : undefined}
				>
					API
				</a>
			</nav>
			<iframe
				className="docs-frame"
				title={apiSelected
					? 'PetQuery API reference'
					: 'PetQuery documentation'}
				src={url}
			/>
		</section>
	);
}
