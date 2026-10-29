/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { enMessages } from '#i18n/en';

export type I18nKey = keyof typeof enMessages;

export interface I18nMessages extends Record<I18nKey,utf8_t>{};
