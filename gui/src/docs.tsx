/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type {ReactElement} from 'react';

const DOCS_URL:utf8_t = '/docs/';

export function Docs():ReactElement{
	return (
		<section className="docs-page">
			<div className="eyebrow">Reference</div>
			<div className="page-heading">
				<div>
					<h2>Documentation</h2>
					<p className="muted">
						Browse the generated API and schema documentation.
					</p>
				</div>
				<a
					className="button-link"
					href={DOCS_URL}
					target="_blank"
					rel="noreferrer"
				>
					Open in new tab
				</a>
			</div>
			<iframe
				className="docs-frame"
				title="PetQuery documentation"
				src={DOCS_URL}
			/>
		</section>
	);
}
