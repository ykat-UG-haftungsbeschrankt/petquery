/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { useState } from 'react';

import type { ReactElement } from 'react';

type AttachmentKind = 'image'|'video'|'link';

function attachmentKind(url:URL):AttachmentKind{
	if('data:' === url.protocol){
		if(/^data:image\/(?:png|jpeg|gif|webp|avif|bmp);/i.test(url.href)){
			return 'image';
		}
		if(/^data:video\/(?:mp4|webm|ogg|quicktime);/i.test(url.href)){
			return 'video';
		}
		return 'link';
	}
	if(/\.(?:png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(url.pathname)){
		return 'image';
	}
	if(/\.(?:mp4|webm|ogv|ogg|mov|m4v)$/i.test(url.pathname)){
		return 'video';
	}
	return 'link';
}

export function Attachment(props:{
	file:uri_t;
	index:size_t;
}):ReactElement{
	const [failed,setFailed] = useState<bool_t>(false);
	const label = `Attached file ${props.index + 1}`;
	const base = window.location.href;
	if(!URL.canParse(props.file,base) || '' === props.file.trim()){
		return <span>{label}: invalid attachment URL.</span>;
	}
	const url = new URL(props.file,base);
	const kind = attachmentKind(url);
	const allowed = 'http:' === url.protocol
		|| 'https:' === url.protocol
		|| ('data:' === url.protocol && 'link' !== kind);
	if(!allowed){
		return <span>{label}: unsupported attachment URL.</span>;
	}

	function onPreviewError():void{
		setFailed(true);
	}

	return (
		<div className="attachment">
			<a href={url.href} target="_blank" rel="noreferrer">
				{label}
			</a>
			{!failed && 'image' === kind && (
				<a
					href={url.href}
					target="_blank"
					rel="noreferrer"
					aria-label={`Open ${label.toLowerCase()}`}
				>
					<img
						className="attachment-preview"
						src={url.href}
						alt={`Preview of ${label.toLowerCase()}`}
						loading="lazy"
						referrerPolicy="no-referrer"
						onError={onPreviewError}
					/>
				</a>
			)}
			{!failed && 'video' === kind && (
				<video
					className="attachment-preview"
					src={url.href}
					aria-label={`Preview of ${label.toLowerCase()}`}
					controls
					playsInline
					preload="metadata"
					onError={onPreviewError}
				>
					Your browser does not support video previews.
				</video>
			)}
			{failed && (
				<p className="muted">
					Preview unavailable. Use the attachment link to open it.
				</p>
			)}
		</div>
	);
}
