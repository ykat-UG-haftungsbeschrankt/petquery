/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import { createContext } from 'react';
import { deMessages } from '#i18n/de';
import { enMessages } from '#i18n/en';
import { useCallback } from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';

import type { I18nKey } from '#i18n/messages';
import type { I18nMessages } from '#i18n/messages';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en'|'de';
export type LanguageSelection = Language|'auto';
export type TranslationValues = Record<utf8_t,string|number>;
export type Translate = (
	message:utf8_t,
	values?:TranslationValues
)=>utf8_t;

type I18nContextValue = {
	language:Language;
	selection:LanguageSelection;
	setSelection:(selection:LanguageSelection)=>void;
	t:Translate;
};

const LANGUAGE_COOKIE = 'language';
const COOKIE_MAX_AGE = 31536000;

const dictionaries:Record<Language,I18nMessages> = {
	en:enMessages,
	de:deMessages
};
const englishKeyByText = new Map<utf8_t,I18nKey>();
function isI18nKey(value:utf8_t):value is I18nKey{
	return Object.hasOwn(enMessages,value);
}
for(const [key,value] of Object.entries(enMessages)){
	if('string' === typeof value && isI18nKey(key)){
		englishKeyByText.set(value,key);
	}
}

const I18nContext = createContext<I18nContextValue|null>(null);

function isLanguage(value:utf8_t|undefined):value is Language{
	return 'en' === value || 'de' === value;
}

export function isLanguageSelection(
	value:utf8_t
):value is LanguageSelection{
	return 'auto' === value || isLanguage(value);
}

function readCookieLanguage():Language|null{
	for(const part of document.cookie.split(';')){
		const [name,value] = part.trim().split('=');
		if(LANGUAGE_COOKIE === name && isLanguage(value)){
			return value;
		}
	}
	return null;
}

function readLanguageSelection():LanguageSelection{
	return readCookieLanguage() ?? 'auto';
}

function detectLanguage():Language{
	const preferences = 0 < navigator.languages.length
		? navigator.languages
		: [navigator.language];
	for(const preference of preferences){
		const language = preference.toLowerCase().split(/[-_]/)[0];
		if(isLanguage(language)){
			return language;
		}
	}
	return 'en';
}

function writeLanguageCookie(selection:LanguageSelection):void{
	const secure = 'https:' === window.location.protocol ? '; Secure' : '';
	if('auto' === selection){
		document.cookie = `${LANGUAGE_COOKIE}=; Max-Age=0; Path=/; `
			+`SameSite=Lax${secure}`;
		return;
	}
	document.cookie = `${LANGUAGE_COOKIE}=${selection}; `
		+`Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export function I18nProvider(props:{
	children:ReactNode;
}):ReactElement{
	const [selection,setCurrentSelection] =
		useState<LanguageSelection>(readLanguageSelection);
	const [language,setLanguage] = useState<Language>(
		()=>readCookieLanguage() ?? detectLanguage()
	);

	const t = useCallback<Translate>((message,values)=>{
		const key = englishKeyByText.get(message);
		const translated = undefined === key
			? message
			: dictionaries[language][key];
		if(undefined === values){
			return translated;
		}
		return translated.replace(/\{([A-Za-z0-9_]+)\}/g,(match,key)=>{
			const value = values[key];
			return undefined === value ? match : String(value);
		});
	},[language]);

	const setSelection = useCallback((
		next:LanguageSelection
	):void=>{
		writeLanguageCookie(next);
		setCurrentSelection(next);
		setLanguage('auto' === next ? detectLanguage() : next);
	},[]);

	useEffect(()=>{
		document.documentElement.lang = language;
	},[language]);

	const context = useMemo<I18nContextValue>(()=>{
		return {language,selection,setSelection,t};
	},[language,selection,setSelection,t]);

	return (
		<I18nContext.Provider value={context}>
			{props.children}
		</I18nContext.Provider>
	);
}

export function useI18n():I18nContextValue{
	const context = useContext(I18nContext);
	if(null === context){
		throw new Error('useI18n must be used within I18nProvider');
	}
	return context;
}
